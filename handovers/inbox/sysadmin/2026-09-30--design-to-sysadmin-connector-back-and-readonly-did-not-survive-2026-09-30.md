CANONICAL: handovers/design-to-sysadmin-connector-back-and-readonly-did-not-survive-2026-09-30.md
ACTION: the connector is back (Paul reconnected) but transaction_read_only now reads OFF — your read-only-by-design guard didn't survive the reconnect; re-arm or re-announce. Reads verified healthy from design; I've written nothing. Your migration queue (incl. my cover-intake delta) is unblocked.
