export function getElementBounds<E extends readonly (HTMLElement | undefined)[]>(elements: E): Promise<{ [K in keyof E]: DOMRectReadOnly }> {
    return new Promise((accept, reject) => {
        let observer: IntersectionObserver;
        observer = new IntersectionObserver((entries: (IntersectionObserverEntry | undefined)[]) => {
            if (entries.length === elements.length) {
                //reject("assertion fail");
                entries.push(...new Array<undefined>(elements.length - entries.length));
            }

            // reorder entries to match elements
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];

                // if this entry is not the element, swap it with the entry that is
                // this will guarantee the correct sorted order, as long as each entry in elements is unique
                // this is not a stable sort with undefineds but it doesn't matter as undefined only has one value
                if (entries[i]?.target != element) {
                    const found = entries.findIndex(e => e?.target === element);
                    const foundEntry = entries[found];
                    entries[found] = entries[i];
                    entries[i] = foundEntry;
                }
            }

            observer.disconnect();
            accept(entries.map(e => e?.boundingClientRect) as any);
        });

        elements.forEach(e => e && observer.observe(e));
    });
}