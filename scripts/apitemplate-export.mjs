#!/usr/bin/env node
/**
 * APITemplate migration — STEP 1 of 3: EXPORT (read-only).
 *
 * Reads every template from the OLD shared account and writes each one to disk
 * as JSON. Touches nothing. Changes nothing. Safe to run as often as you like.
 *
 *   node scripts/apitemplate-export.mjs
 *
 * Requires:
 *   APITEMPLATE_OLD_KEY=...   the shared Clarence + AuthorsLab account key
 *
 * Optional:
 *   APITEMPLATE_REGION=rest | rest-de | rest-us | rest-au   (default: rest)
 *   APITEMPLATE_OUT=<dir>                                   (default: ./apitemplate-export)
 *
 * ─── WHY THIS IS A SCRIPT YOU RUN, NOT SOMETHING I DO ────────────────────────
 * Your API keys should not pass through a chat. This runs on your machine with
 * your keys in your environment, and writes files you can read before anything
 * is pushed anywhere.
 *
 * ─── WHAT THE API ACTUALLY SUPPORTS (verified 2026-10-01) ────────────────────
 * TemplateManagementApi, the complete surface, from the generated SDK:
 *     GET  /v2/list-templates    list
 *     GET  /v2/get-template      read one
 *     POST /v2/update-template   write one that ALREADY EXISTS
 *
 * There is NO create-template endpoint. A template must be created by hand in
 * the web console, which is what mints its id. So the migration is:
 *     1. export        (this script, automatic)
 *     2. create empty  (you, in the new account's console — 7 clicks)
 *     3. push content  (apitemplate-import.mjs, automatic)
 *
 * ─── THE QUESTION THIS SCRIPT ANSWERS ────────────────────────────────────────
 * get-template and update-template are documented as PDF-template operations.
 * At least one of our templates is likely an IMAGE template (5.2 Taylor
 * Generate Covers). If get-template refuses or returns a different shape for
 * those, we need a different route for them — and it is much better to learn
 * that now, from a read, than during a cutover.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const KEY = process.env.APITEMPLATE_OLD_KEY
const REGION = process.env.APITEMPLATE_REGION || 'rest'
const OUT = process.env.APITEMPLATE_OUT || './apitemplate-export'
const BASE = `https://${REGION}.apitemplate.io/v2`

if (!KEY) {
    console.error('APITEMPLATE_OLD_KEY is not set.\n')
    console.error('  export APITEMPLATE_OLD_KEY="your-old-account-key"')
    console.error('  node scripts/apitemplate-export.mjs')
    process.exit(1)
}

async function api(path, params = {}) {
    const url = new URL(BASE + path)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

    const res = await fetch(url, { headers: { 'X-API-KEY': KEY } })
    const text = await res.text()

    let json
    try {
        json = JSON.parse(text)
    } catch {
        throw new Error(`${path} returned non-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`)
    }

    // The API returns HTTP 200 with {"status":"error"} in some cases, so an ok
    // status code is not evidence of success. Check what it actually said.
    if (!res.ok || json.status === 'error') {
        throw new Error(`${path} failed (HTTP ${res.status}): ${json.message || text.slice(0, 300)}`)
    }
    return json
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
    console.log(`\nAPITemplate export — region ${REGION}\n`)

    const list = await api('/list-templates')
    const templates = list.templates || []

    if (templates.length === 0) {
        console.log('No templates found. Check the key is for the OLD account.')
        return
    }

    console.log(`${templates.length} templates in this account:\n`)
    for (const t of templates) {
        console.log(`  ${t.template_id}  ${(t.format || '?').padEnd(5)}  ${t.name}`)
    }
    console.log()

    await mkdir(OUT, { recursive: true })

    const manifest = []
    let exported = 0
    let refused = 0

    for (const t of templates) {
        process.stdout.write(`  fetching ${t.template_id} (${t.format}) … `)
        try {
            const full = await api('/get-template', { template_id: t.template_id })
            const file = join(OUT, `${t.template_id}.json`)
            await writeFile(file, JSON.stringify(full, null, 2))

            const bytes = JSON.stringify(full).length
            console.log(`ok, ${bytes.toLocaleString()} bytes → ${file}`)

            manifest.push({
                template_id: t.template_id,
                name: t.name,
                format: t.format,
                exported: true,
                bytes,
                file: `${t.template_id}.json`,
            })
            exported++
        } catch (err) {
            // Record the refusal rather than aborting: a format this endpoint
            // cannot read is exactly the finding we are looking for, and we
            // want the complete picture in one run.
            console.log(`REFUSED — ${err.message}`)
            manifest.push({
                template_id: t.template_id,
                name: t.name,
                format: t.format,
                exported: false,
                error: err.message,
            })
            refused++
        }
        await sleep(150) // well inside 100 requests / 10s
    }

    await writeFile(
        join(OUT, '_manifest.json'),
        JSON.stringify(
            { exportedAt: new Date().toISOString(), region: REGION, templates: manifest },
            null,
            2
        )
    )

    console.log(`\n${exported} exported, ${refused} refused. Manifest: ${join(OUT, '_manifest.json')}\n`)

    const byFormat = {}
    for (const m of manifest) byFormat[m.format || '?'] = (byFormat[m.format || '?'] || 0) + 1
    console.log('By format:', byFormat)

    if (refused > 0) {
        console.log(
            `\n⚠  ${refused} template(s) could not be read. If these are IMAGE templates,\n` +
            `   get-template/update-template may be PDF-only and those need a different route.\n` +
            `   Send me _manifest.json and I will work out what that route is.`
        )
    }

    console.log(
        `\nNEXT: nothing has changed anywhere. Read a couple of the JSON files, then\n` +
        `create the matching empty templates in the NEW account's console and note\n` +
        `their new ids. Step 3 pushes the content into them.\n`
    )
}

main().catch((err) => {
    console.error(`\nFailed: ${err.message}\n`)
    process.exit(1)
})
