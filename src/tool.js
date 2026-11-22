/*! Eretek Online Araçlar #83 — PDU ve Priz Kapasitesi */
ERT.def('83', {
	run: function (v, c) {
		var D = 0, SA = 0, SB = 0, rows = [], single = 0, toggle = 0;
		c.lines(v.dev, 300, 'dev').forEach(function (l, i) {
			var p = l.split(/[;\t]/).map(function (x) { return x.trim(); }), w = ERT.parseNum(p[1], 'en'), ps = p[2] ? ERT.parseNum(p[2], 'en') : 2, f = (p[3] || '').toUpperCase(), q = p[4] ? ERT.parseNum(p[4], 'en') : 1;
			if (!(w > 0) || !(ps === 1 || ps === 2) || (f && f !== 'A' && f !== 'B') || !(q >= 1) || Math.floor(q) !== q) { throw c.fe('dev', 'rowFmt', { r: i + 1 }); }
			var tw = w * q;
			if (ps === 2) { D += tw; rows.push([p[0], q, c.n(tw, 0), 'A+B', c.n(tw / 2, 0), c.n(tw / 2, 0)]); }
			else { var side = f || (toggle++ % 2 ? 'B' : 'A'); if (side === 'A') { SA += tw; } else { SB += tw; } single += q; rows.push([p[0], q, c.n(tw, 0), side, side === 'A' ? c.n(tw, 0) : '–', side === 'B' ? c.n(tw, 0) : '–']); }
		});
		var A = D / 2 + SA, B = D / 2 + SB, fb = D + SB, fa = D + SA; // fb: A düşerse B'nin yükü; fa: B düşerse A'nın yükü
		var cap = v.volt * v.amp * (v.phase === '3' ? Math.sqrt(3) : 1), lim = cap * (v.derate || 80) / 100, msgs = [];
		var vv = { a: Math.round(A), b: Math.round(B), failA: Math.round(fb), failB: Math.round(fa), limit: Math.round(lim) };
		msgs.push(Math.max(A, B) > lim ? ['err', c.t('normOver')] : ['ok', c.t('normOk', { p: c.pct(Math.max(A, B) / lim, 0) })]);
		msgs.push(Math.max(fa, fb) > lim ? ['err', c.t('failOver', { w: c.n(Math.max(fa, fb), 0), l: c.n(lim, 0) })] : ['ok', c.t('failOk', { p: c.pct(Math.max(fa, fb) / lim, 0) })]);
		if (single) { msgs.push(['warn', c.t('single', { n: single })]); }
		msgs.push(['info', c.t('measured')]);
		var kv = [[c.t('cap'), c.n(cap, 0) + ' W (' + c.n(v.amp, 0) + ' A × ' + c.n(v.volt, 0) + ' V' + (v.phase === '3' ? ' × √3' : '') + ')'], [c.t('lim', { p: v.derate || 80 }), c.n(lim, 0) + ' W'], [c.t('a'), c.n(A, 0) + ' W · ' + c.n(A / v.volt / (v.phase === '3' ? Math.sqrt(3) : 1), 1) + ' A'], [c.t('b'), c.n(B, 0) + ' W · ' + c.n(B / v.volt / (v.phase === '3' ? Math.sqrt(3) : 1), 1) + ' A'], [c.t('fA'), c.n(fb, 0) + ' W'], [c.t('fB'), c.n(fa, 0) + ' W']];
		return { big: Math.max(fa, fb) > lim ? c.t('bigNo') : c.t('bigOk'), kv: kv, msgs: msgs, tables: [{ cols: [c.t('c_n'), c.t('c_q'), 'W', 'PDU', 'A (W)', 'B (W)'], rows: rows }], x: { copy: kv.map(function (k) { return k[0] + ': ' + k[1]; }).join('\n') }, v: vv };
	}
});
