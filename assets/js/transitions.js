const PAGE_ORDER = ["index.html", "habitation.html", "municipality.html", "dashboard.html", "buildings.html"];

function getDirection(fromPath, toPath) {
    const fromIdx = PAGE_ORDER.indexOf(fromPath.split("/").pop());
    const toIdx = PAGE_ORDER.indexOf(toPath.split("/").pop());
    return fromIdx < toIdx ? "l" : "r";
}

window.addEventListener("pagereveal", e => {
    if (e.viewTransition) {
        const from = new URL(navigation.activation.from.url);
        const to = new URL(navigation.activation.entry.url);
        e.viewTransition.types.add(getDirection(from.pathname, to.pathname));
    }
});

window.addEventListener("pageswap", e => {
    if (e.viewTransition) {
        const from = new URL(e.activation.from.url);
        const to = new URL(e.activation.entry.url);
        e.viewTransition.types.add(getDirection(from.pathname, to.pathname));
    }
});
