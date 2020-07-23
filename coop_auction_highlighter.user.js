// ==UserScript==
// @name         Co-op Auction Highlighter
// @version      0.1
// @namespace    HN67
// @description  Adds XKI's Card Co-op logo beside members nations during an auction
// @author       HN67
// @downloadURL  https://github.com/HN67/xki-cards/raw/master/coop_auction_highlighter.user.js
// @noframes
// @match        https://www.nationstates.net/*page=deck*/*card=*
// @match        https://www.nationstates.net/*card=*/*page=deck*
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @connect      docs.google.com
// @connect      googleusercontent.com
// ==/UserScript==

/*
 * This file is a modified version of
 * https://github.com/dithpri/RCES/raw/master/userscripts/auction/Guildies%20Auction%20Highlighter%20UwU.user.js
 * (Version 0.9)
 * See the license below.
 */

/*
 * Copyright (c) 2020 dithpri (Racoda) <dithpri@gmail.com>
 * This file is part of RCES: https://github.com/dithpri/RCES and licensed under
 * the MIT license. See LICENSE.md or
 * https://github.com/dithpri/RCES/blob/master/LICENSE.md for more details.
 */

/* Permissions:
 *
 * GM.xmlHttpRequest, `connect docs.google.com`, `connect googleusercontent.com`:
 *     to automatically fetch and update Guild members' card collecting nations.
 *
 * GM.setValue, GM.getValue:
 *     to save and load Guild members' card collecting nations locally.
 */

function GM_addStyle(style) {
	"use strict";
	var node = document.createElement("style");
	node.innerHTML = style;
	document.getElementsByTagName("head")[0].appendChild(node);
}

(async function () {
	"use strict";

	const source_sheet = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSem15AVLXgdjxWBZOnWRFnF6NwkY0gVKPYI8aWuHJzlbyILBL3o1F5GK1hSK3iiBlXLIZBI5jdpkVr/pub?gid=916202163&single=true&output=tsv"

	const update_auctiontable = async function () {
		const guild_members_array = (
			await GM.getValue("xki-cards-coop", "")
		).split("\n");
		document
			.querySelectorAll(
				"#cardauctiontable > tbody > tr > td > p > a.nlink"
			)
			.forEach(function (el, i) {
				const canonical_nname = el
					.getAttribute("href")
					.replace(/^nation=/, "");
				if (guild_members_array.includes(canonical_nname)) {
					el.parentNode.parentNode.classList.add(
						"hn67-class-xki-cardcoop"
					);
				} else {
					el.parentNode.parentNode.classList.remove(
						"hn67-class-xki-card_coop"
					);
				}
			});
	};

	if (document.getElementById("auctiontablebox")) {
		// If we haven't updated in the last 12h
		const lastUpdate = await GM.getValue("xki-cards-coop-lastupdate", 0);
		if (
			lastUpdate + 12 * 60 * 60 * 1000 < new Date().getTime()
		) {
			GM.xmlHttpRequest({
				method: "GET",
				url: source_sheet,
				onload: async function (data) {
					console.info("updated");
					await GM.setValue(
						"xki-cards-coop",
						data.responseText
							.split("\n")
							.map((x) =>
								x
									.split("\t")[0]
									.toLowerCase()
									.replace(/ /g, "_")
							)
							.join("\n")
					);
					GM.setValue(
						"xki-cards-coop-lastupdate",
						new Date().getTime()
					);
					update_auctiontable();
				},
			});
		}

		update_auctiontable();

		let observer = new MutationObserver(function (mutationList) {
			update_auctiontable();
		});

		const observerOptions = {
			childList: true,
		};

		observer.observe(
			document.getElementById("auctiontablebox"),
			observerOptions
		);

    	const image = `url(data:image/png;base64,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)`

        GM_addStyle(`
.hn67-class-xki-cardcoop {
background-repeat: no-repeat;
}
tr > td.hn67-class-xki-cardcoop:nth-child(1) {
background-image: linear-gradient(90deg, rgba(255,255,255,0), rgb(255,255,255) 50px, rgba(255,255,255,0) 100px), ` + image + `;
background-position: left;
}
tr > td.hn67-class-xki-cardcoop:nth-child(5) {
background-image: linear-gradient(270deg, rgba(255,255,255,0), rgb(255,255,255) 50px, rgba(255, 255, 255, 0) 100px), ` + image + `;
background-position: right;
}
`);
	}
})();
