#!/usr/bin/env node
/**
 * APITemplate migration — STEP 3 of 3: IMPORT into the NEW account.
 *
 *   node scripts/apitemplate-import.mjs            # dry run, writes nothing
 *   node scripts/apitemplate-import.mjs --apply    # actually writes
 *   node scripts/apitemplate-import.mjs --probe    # write ONE template, verify, stop
 *
 * Requires:
 *   APITEMPLATE_NEW_KEY=...   the NEW AuthorsLab-only account key
 *
 * Optional:
 *   APITEMPLATE_REGION=rest | rest-de | rest-us | rest-au   (default: rest)
 *   APITEMPLATE_OUT=<dir>                                   (default: ./apitemplate-export)
 *
 * ─── READ THIS BEFORE RUNNING ────────────────────────────────────────────────
 *
 * 1. THIS SCRIPT NEVER TOUCHES THE OLD ACCOUNT. It reads exported JSON from
 *    disk and writes only to the key in APITEMPLATE_NEW_KEY. It refuses to run
 *    if that key matches APITEMPLATE_OLD_KEY, because overwriting the live
 *    Clarence templates is the one truly bad outcome available here.
 *
 * 2. THE API CANNOT CREATE A TEMPLATE. There is no create-template endpoint.
 *    You must create each one by hand in the new account's console first —
 *    that is what mints its id — then record old→new in _mapping.json.
 *    Run this script once with no mapping file and it will write the stub.
 *
 * 3. UPDATE-TEMPLATE IS DOCUMENTED AS BODY + CSS ONLY.
 *    get-template returns FOUR fields: body, css, sample_json, settings.
 *    UpdateTemplateRequest documents only: template_id, body, css.
 *    So `settings` — paper size, margins, orientation, header/footer — and
 *    `sample_json` may NOT be restorable by API, and may need setting by hand
 *    in each template's Settings tab.
 *
 *    BOTH ENDPOINTS ARE MARKED "experimental API, contact support" by the
 *    vendor, so the documentation is not necessarily the whole surface. This
 *    script therefore SENDS all four fields and then READS THE TEMPLATE BACK
 *    to report which ones actually persisted. It does not assume either way.
 *    Run with --probe first: one template, full verification, then stop.
 *
 * 4. VERIFICATION IS A READ-BACK, NOT AN ABSENCE OF ERROR. A 200 response
 *    proves the request was accepted, not that the content is there. Every
 *    field is compared against what we sent.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const NEW_KEY = process.env.APITEMPLATE_NEW_KEY
const OLD_KEY = process.env.APITEMPLATE_OLD_KEY
const REGION = process.env.APITEMPLATE_REGION || 'rest'
const OUT = process.env.APITEMPLATE_OUT || './apitemplate-export'
const BASE = `https://${REGION}.apitemplate.io/v2`

const APPLY = process.argv.includes('--apply')
const PROBE = process.argv.includes('--probe')
const MAPPING_FILE = join(OUT, '_mapping.json')

if (!NEW_KEY) {
    console.error('APITEMPLATE_NEW_KEY is not set.\n')
    console.error('  export APITEMPLATE_NEW_KEY="your-NEW-account-key"')
    console.error('  node scripts/apitemplate-import.mjs --probe')
    process.exit(1)
}

// The guard that matters. Writing the old account would overwrite live
// Clarence templates, which is unrecoverable from here.
if (OLD_KEY && NEW_KEY === OLD_KEY) {
    console.error('REFUSING TO RUN: APITEMPLATE_NEW_KEY is the same as APITEMPLATE_OLD_KEY.')
    console.error('That would overwrite the live shared account. Check your environment.')
    process.exit(1)
}

async function api(path, { method = 'GET', params = {}, body } = {}) {
    const url = new URL(BASE + path)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

    const res = await fetch(url, {
        method,
        headers: { 'X-API-KEY': NEW_KEY, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()

    let json
    try {
        json = JSON.parse(text)
    } catch {
        throw new Error(`${path} returned non-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`)
    }
    if (!res.ok || json.status === 'error') {
        throw new Error(`${path} failed (HTTP ${res.status}): ${json.message || text.slice(0, 300)}`)
    }
    return json
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const same = (a, b) => (a ?? '') === (b ?? '')

async function writeMappingStub(manifest) {
    // Only the seven templates n8n actually calls. "Alex Initial Analysis"
    // (96c77b23eb52a4b4) exists in the account but no workflow references it —
    // see publishing's sweep of all 33 workflows, 2026-10-01.
    const WANTED = new Set([
        '68777b23605355c4', // 00.04 Free Manuscript Analysis
        'e0277b23e6c9db42', // 1.5  Manuscript Version
        '79877b23e3adb572', // 2.3 + 2.3R Alex Full Manuscript Analysis
        '16377b23e6301260', // 3.1  Sam Full Manuscript Analysis
        '12b77b23ed8e7f8a', // 4.1  Jordan Full Manuscript Analysis
        '6e677b23e5f897bc', // 5.1  Taylor Publishing Plan
        'cee77b23e127e78a', // 6.1  Final Manuscript PDF
    ])

    const stub = {
        _instructions:
            'Create each template by hand in the NEW account console, then paste its new id as the value. Leave a value empty to skip that template.',
        mapping: Object.fromEntries(
            manifest.templates
                .filter((t) => WANTED.has(t.template_id))
                .map((t) => [t.template_id, { name: t.name, new_template_id: '' }])
        ),
    }
    await writeFile(MAPPING_FILE, JSON.stringify(stub, null, 2))
    console.log(`\nWrote mapping stub: ${MAPPING_FILE}`)
    console.log('Fill in new_template_id for each, then run again.\n')
}

async function main() {
    const manifest = JSON.parse(await readFile(join(OUT, '_manifest.json'), 'utf8'))

    if (!existsSync(MAPPING_FILE)) {
        await writeMappingStub(manifest)
        return
    }

    const { mapping } = JSON.parse(await readFile(MAPPING_FILE, 'utf8'))
    const pairs = Object.entries(mapping).filter(([, v]) => v.new_template_id)

    if (pairs.length === 0) {
        console.log(`No new_template_id values filled in yet in ${MAPPING_FILE}.`)
        return
    }

    const mode = PROBE ? 'PROBE (one template)' : APPLY ? 'APPLY' : 'DRY RUN (no writes)'
    console.log(`\nAPITemplate import — region ${REGION} — ${mode}\n`)
    console.log(`${pairs.length} template(s) mapped:\n`)
    for (const [oldId, v] of pairs) {
        console.log(`  ${oldId} → ${v.new_template_id}   ${v.name}`)
    }
    console.log()

    if (!APPLY && !PROBE) {
        console.log('Dry run only. Nothing written.')
        console.log('Run with --probe to write and verify ONE template first.\n')
        return
    }

    const todo = PROBE ? pairs.slice(0, 1) : pairs
    const results = []

    for (const [oldId, v] of todo) {
        const newId = v.new_template_id
        console.log(`──── ${v.name}`)
        console.log(`     ${oldId} → ${newId}`)

        const src = JSON.parse(await readFile(join(OUT, `${oldId}.json`), 'utf8'))

        // Send everything we have. body + css are documented; sample_json and
        // settings are not, but the endpoint is experimental and may accept
        // them. The read-back below is what tells us the truth.
        const payload = {
            template_id: newId,
            body: src.body,
            css: src.css,
            sample_json: src.sample_json,
            settings: src.settings,
        }

        try {
            await api('/update-template', { method: 'POST', body: payload })
            console.log('     update-template: accepted')
        } catch (err) {
            console.log(`     update-template: FAILED — ${err.message}`)
            results.push({ oldId, newId, name: v.name, ok: false, error: err.message })
            continue
        }

        await sleep(400)

        // Read back. A 200 is not evidence the content landed.
        let check
        try {
            check = await api('/get-template', { params: { template_id: newId } })
        } catch (err) {
            console.log(`     read-back: FAILED — ${err.message}`)
            results.push({ oldId, newId, name: v.name, ok: false, error: `read-back: ${err.message}` })
            continue
        }

        const fields = {
            body: same(check.body, src.body),
            css: same(check.css, src.css),
            sample_json: same(check.sample_json, src.sample_json),
            settings: same(check.settings, src.settings),
        }

        for (const [f, ok] of Object.entries(fields)) {
            const srcLen = (src[f] ?? '').length
            const gotLen = (check[f] ?? '').length
            console.log(
                `     ${f.padEnd(12)} ${ok ? 'matches' : `DIFFERS  (sent ${srcLen}, stored ${gotLen})`}`
            )
        }

        results.push({ oldId, newId, name: v.name, ok: fields.body && fields.css, fields })
        console.log()
        await sleep(300)
    }

    await writeFile(
        join(OUT, '_import-result.json'),
        JSON.stringify({ ranAt: new Date().toISOString(), mode, results }, null, 2)
    )

    const unrestorable = new Set()
    for (const r of results) {
        if (!r.fields) continue
        for (const [f, ok] of Object.entries(r.fields)) if (!ok) unrestorable.add(f)
    }

    console.log('─────────────────────────────────────────────')
    console.log(`${results.filter((r) => r.ok).length}/${results.length} had body + css restored.`)

    if (unrestorable.size > 0) {
        console.log(
            `\n⚠  These fields did NOT round-trip: ${[...unrestorable].join(', ')}`
        )
        console.log(
            `   They must be set by hand in each template's tab in the console.`
        )
        console.log(
            `   'settings' holds paper size, margins, orientation and header/footer —\n` +
            `   a PDF can render with the right content and the wrong page setup, so\n` +
            `   check these before cutover, not after.`
        )
    } else {
        console.log('\nAll four fields round-tripped. No manual tab copying needed.')
    }

    if (PROBE) {
        console.log(
            `\nPROBE complete — one template written, nothing else touched.\n` +
            `If the fields above look right, run with --apply for the rest.\n`
        )
    }

    console.log(`\nResult written to ${join(OUT, '_import-result.json')}\n`)
    console.log(
        `NEXT, AND NOT BEFORE: generate a test PDF from each NEW template while the\n` +
        `old ones are still live, and compare output size against the known baselines\n` +
        `(Alex 272KB–693KB and content-varying; 6.1 a constant 10,648). Only then\n` +
        `cut the workflows over, credential and template id together, 2.3 last.\n`
    )
}

main().catch((err) => {
    console.error(`\nFailed: ${err.message}\n`)
    process.exit(1)
})
