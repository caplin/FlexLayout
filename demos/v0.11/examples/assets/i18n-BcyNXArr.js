import{_ as e,a as t,f as n,n as r,o as i,t as a,v as o,y as s}from"./Header-DaenXOHN.js";import{t as c}from"./ContextMenuBuilder-CAHTHLCj.js";var l=s(o(),1),u=e(),d=`import * as React from "react";
import { createRoot } from "react-dom/client";
import { BorderNode, ContextMenuBuilder, IJsonModel, ILayoutApi, Layout, Model, PopupMenuEntry, TabGroupNode, TabNode, TabSetNode, showPopupMenu } from "../../src/index";
import "../../style/combined.scss";
import { ExampleHeader } from "../Header";
import sourceCode from "./I18n.tsx?raw";

const translations: Record<string, Record<string, string>> = {
    en: {
        // Model text
        "i18n.tab.welcome": "Welcome",
        "i18n.tab.settings": "Settings",
        "i18n.tab.about": "About",
        "i18n.tab.profile": "Profile",
        "i18n.group.general": "General",
        "i18n.group.advanced": "Advanced",
        "i18n.tabset.main": "Main Panel",
        // UI labels (I18nLabel enum values)
        "flexlayout.ui.close.tab": "Close",
        "flexlayout.ui.pinned.tab": "Pinned",
        "flexlayout.ui.rename.tab": "Rename tab",
        "flexlayout.ui.close.tabset": "Close tabset",
        "flexlayout.ui.active.tabset": "Active tabset",
        "flexlayout.ui.move.tabset": "Move tabset",
        "flexlayout.ui.move.tabs (?)": "Move tabs (?)",
        "flexlayout.ui.move.group (?)": "Move group (?)",
        "flexlayout.ui.maximize.tabset": "Maximize tabset",
        "flexlayout.ui.restore.tabset": "Restore tabset",
        "flexlayout.ui.popout.tab": "Popout selected tab",
        "flexlayout.ui.popout.tab.float": "Float selected tab",
        "flexlayout.ui.popout.float.to.window": "Popout panel",
        "flexlayout.ui.dock.float.to.layout": "Drag into another layout",
        "flexlayout.ui.dock.float.tabs (?)": "Dock tabs (?)",
        "flexlayout.ui.overflow.menu.tooltip": "Hidden tabs",
        "flexlayout.ui.splitter": "Resize",
        "flexlayout.ui.error.rendering.component": "Error rendering component",
        "flexlayout.ui.error.rendering.component.retry": "Retry",
        "flexlayout.ui.popout.window.name": "Popout Window",
        "flexlayout.ui.menu.rename": "Rename",
        "flexlayout.ui.menu.pin": "Pin",
        "flexlayout.ui.menu.unpin": "Unpin",
        "flexlayout.ui.menu.popout": "Popout",
        "flexlayout.ui.menu.float": "Float",
        "flexlayout.ui.menu.popout.tabset": "Pop out tabset",
        "flexlayout.ui.menu.float.tabset": "Float tabset",
        "flexlayout.ui.menu.maximize": "Maximize",
        "flexlayout.ui.menu.restore": "Restore",
        "flexlayout.ui.menu.overlay": "Overlay",
        "flexlayout.ui.menu.split": "Split",
        "flexlayout.ui.menu.close.all": "Close All",
        "flexlayout.ui.menu.close.right": "Close to the Right",
        "flexlayout.ui.menu.close.others": "Close Others",
        "flexlayout.ui.menu.add.to.new.group": "Add to new group",
        "flexlayout.ui.menu.add.to.group": "Add to group",
        "flexlayout.ui.menu.remove.from.group": "Remove from group",
        "flexlayout.ui.menu.ungroup": "Ungroup",
        "flexlayout.ui.menu.expand": "Expand",
        "flexlayout.ui.menu.collapse": "Collapse",
        "flexlayout.ui.rename.group": "Rename group",
        "flexlayout.ui.group.color": "Group color",
        "flexlayout.ui.group.pill.tooltip": "Tab Group, click to expand/collapse",
        "flexlayout.ui.group.name.label": "Name",
        "flexlayout.ui.group.name.placeholder": "Group Name",
        "flexlayout.ui.group.color.n": "Group color ?",
        "flexlayout.ui.group.default.name": "Group",
    },
    es: {
        // Model text
        "i18n.tab.welcome": "Bienvenido",
        "i18n.tab.settings": "Configuraci\\u00f3n",
        "i18n.tab.about": "Acerca de",
        "i18n.tab.profile": "Perfil",
        "i18n.group.general": "General",
        "i18n.group.advanced": "Avanzado",
        "i18n.tabset.main": "Panel Principal",
        // UI labels
        "flexlayout.ui.close.tab": "Cerrar",
        "flexlayout.ui.pinned.tab": "Fijado",
        "flexlayout.ui.rename.tab": "Renomrar pesta\\u00f1a",
        "flexlayout.ui.close.tabset": "Cerrar pesta\\u00f1as",
        "flexlayout.ui.active.tabset": "Pesta\\u00f1as activas",
        "flexlayout.ui.move.tabset": "Mover pesta\\u00f1as",
        "flexlayout.ui.move.tabs (?)": "Mover pesta\\u00f1as (?)",
        "flexlayout.ui.move.group (?)": "Mover grupo (?)",
        "flexlayout.ui.maximize.tabset": "Maximizar pesta\\u00f1as",
        "flexlayout.ui.restore.tabset": "Restaurar pesta\\u00f1as",
        "flexlayout.ui.popout.tab": "Ventana con pesta\\u00f1a",
        "flexlayout.ui.popout.tab.float": "Pesta\\u00f1a flotante",
        "flexlayout.ui.popout.float.to.window": "Ventana",
        "flexlayout.ui.dock.float.to.layout": "Arrastrar a otro dise\\u00f1o",
        "flexlayout.ui.dock.float.tabs (?)": "Acoplar pesta\\u00f1as (?)",
        "flexlayout.ui.overflow.menu.tooltip": "Pesta\\u00f1as ocultas",
        "flexlayout.ui.splitter": "Redimensionar",
        "flexlayout.ui.error.rendering.component": "Error al renderizar el componente",
        "flexlayout.ui.error.rendering.component.retry": "Reintentar",
        "flexlayout.ui.popout.window.name": "Ventana emergente",
        "flexlayout.ui.menu.rename": "Renombrar",
        "flexlayout.ui.menu.pin": "Fijar",
        "flexlayout.ui.menu.unpin": "Desfijar",
        "flexlayout.ui.menu.popout": "Ventana",
        "flexlayout.ui.menu.float": "Flotante",
        "flexlayout.ui.menu.popout.tabset": "Pesta\\u00f1as en ventana",
        "flexlayout.ui.menu.float.tabset": "Pesta\\u00f1as flotantes",
        "flexlayout.ui.menu.maximize": "Maximizar",
        "flexlayout.ui.menu.restore": "Restaurar",
        "flexlayout.ui.menu.overlay": "Superpuesto",
        "flexlayout.ui.menu.split": "Dividir",
        "flexlayout.ui.menu.close.all": "Cerrar todo",
        "flexlayout.ui.menu.close.right": "Cerrar a la derecha",
        "flexlayout.ui.menu.close.others": "Cerrar otros",
        "flexlayout.ui.menu.add.to.new.group": "Agregar a nuevo grupo",
        "flexlayout.ui.menu.add.to.group": "Agregar a grupo",
        "flexlayout.ui.menu.remove.from.group": "Quitar del grupo",
        "flexlayout.ui.menu.ungroup": "Desagrupar",
        "flexlayout.ui.menu.expand": "Expandir",
        "flexlayout.ui.menu.collapse": "Colapsar",
        "flexlayout.ui.rename.group": "Renombrar grupo",
        "flexlayout.ui.group.color": "Color del grupo",
        "flexlayout.ui.group.pill.tooltip": "Grupo de pesta\\u00f1as, haga clic para expandir/colapsar",
        "flexlayout.ui.group.name.label": "Nombre",
        "flexlayout.ui.group.name.placeholder": "Nombre del grupo",
        "flexlayout.ui.group.color.n": "Color del grupo ?",
        "flexlayout.ui.group.default.name": "Grupo",
    },
    de: {
        // Model text
        "i18n.tab.welcome": "Willkommen",
        "i18n.tab.settings": "Einstellungen",
        "i18n.tab.about": "\\u00dcber",
        "i18n.tab.profile": "Profil",
        "i18n.group.general": "Allgemein",
        "i18n.group.advanced": "Erweitert",
        "i18n.tabset.main": "Hauptpanel",
        // UI labels
        "flexlayout.ui.close.tab": "Schlie\\u00dfen",
        "flexlayout.ui.pinned.tab": "Angeheftet",
        "flexlayout.ui.rename.tab": "Tab umbenennen",
        "flexlayout.ui.close.tabset": "Tabs schlie\\u00dfen",
        "flexlayout.ui.active.tabset": "Aktiver Tabstreifen",
        "flexlayout.ui.move.tabset": "Tabstreifen verschieben",
        "flexlayout.ui.move.tabs (?)": "Tabs verschieben (?)",
        "flexlayout.ui.move.group (?)": "Cluster verschieben (?)",
        "flexlayout.ui.maximize.tabset": "Tabstreifen maximieren",
        "flexlayout.ui.restore.tabset": "Tabstreifen wiederherstellen",
        "flexlayout.ui.popout.tab": "Tab in Fenster \\u00f6ffnen",
        "flexlayout.ui.popout.tab.float": "Tab schwebend machen",
        "flexlayout.ui.popout.float.to.window": "Fenster",
        "flexlayout.ui.dock.float.to.layout": "In anderes Layout ziehen",
        "flexlayout.ui.dock.float.tabs (?)": "Tabs andocken (?)",
        "flexlayout.ui.overflow.menu.tooltip": "Versteckte Tabs",
        "flexlayout.ui.splitter": "Gr\\u00f6\\u00dfe \\u00e4ndern",
        "flexlayout.ui.error.rendering.component": "Fehler beim Rendern der Komponente",
        "flexlayout.ui.error.rendering.component.retry": "Erneut versuchen",
        "flexlayout.ui.popout.window.name": "Schwebendes Fenster",
        "flexlayout.ui.menu.rename": "Umbenennen",
        "flexlayout.ui.menu.pin": "Anheften",
        "flexlayout.ui.menu.unpin": "L\\u00f6sen",
        "flexlayout.ui.menu.popout": "Fenster",
        "flexlayout.ui.menu.float": "Schwebend",
        "flexlayout.ui.menu.popout.tabset": "Tabs im Fenster",
        "flexlayout.ui.menu.float.tabset": "Schwebende Tabs",
        "flexlayout.ui.menu.maximize": "Maximieren",
        "flexlayout.ui.menu.restore": "Wiederherstellen",
        "flexlayout.ui.menu.overlay": "\\u00dcberlagert",
        "flexlayout.ui.menu.split": "Teilen",
        "flexlayout.ui.menu.close.all": "Alle schlie\\u00dfen",
        "flexlayout.ui.menu.close.right": "Rechts schlie\\u00dfen",
        "flexlayout.ui.menu.close.others": "Andere schlie\\u00dfen",
        "flexlayout.ui.menu.add.to.new.group": "Zu neuem Cluster hinzuf\\u00fcgen",
        "flexlayout.ui.menu.add.to.group": "Zu Cluster hinzuf\\u00fcgen",
        "flexlayout.ui.menu.remove.from.group": "Aus Cluster entfernen",
        "flexlayout.ui.menu.ungroup": "Cluster aufl\\u00f6sen",
        "flexlayout.ui.menu.expand": "Erweitern",
        "flexlayout.ui.menu.collapse": "Zusammenklappen",
        "flexlayout.ui.rename.group": "Cluster umbenennen",
        "flexlayout.ui.group.color": "Clusterfarbe",
        "flexlayout.ui.group.pill.tooltip": "Tab-Cluster, klicken zum Erweitern/Zusammenklappen",
        "flexlayout.ui.group.name.label": "Name",
        "flexlayout.ui.group.name.placeholder": "Clustername",
        "flexlayout.ui.group.color.n": "Clusterfarbe ?",
        "flexlayout.ui.group.default.name": "Cluster",
    },
};

const json: IJsonModel = {
    global: {
        tabEnableRename: true,
        tabEnablePin: true,
        tabSetEnableCloseButton: true,
        tabSetEnableTabGroups: true,
    },
    layout: {
        type: "row",
        children: [
            {
                type: "tabset",
                id: "ts0",
                name: "i18n.tabset.main",
                weight: 50,
                children: [
                    {
                        type: "tabgroup",
                        name: "i18n.group.general",
                        color: "#3b7de7",
                        children: [
                            { type: "tab", id: "t0", name: "i18n.tab.welcome", component: "panel" },
                            { type: "tab", id: "t1", name: "i18n.tab.settings", component: "panel" },
                        ],
                    },
                    {
                        type: "tabgroup",
                        name: "i18n.group.advanced",
                        color: "#94b870",
                        children: [
                            { type: "tab", id: "t2", name: "i18n.tab.about", component: "panel" },
                            { type: "tab", id: "t3", name: "i18n.tab.profile", component: "panel" },
                        ],
                    },
                ],
            },
            {
                type: "tabset",
                id: "ts1",
                weight: 50,
                children: [{ type: "tab", id: "t4", name: "i18n.tab.welcome", component: "panel" }],
            },
        ],
    },
};

const model = Model.fromJson(json);

const getTranslator = (lang: string) => (key: string) => translations[lang][key] ?? key;

const factory = (node: TabNode) => {
    if (node.getComponent() === "panel") {
        return (
            <div style={{ padding: 20 }}>
                <h2>{node.getName()}</h2>
                <p>This tab&apos;s name is translated from the model via the i18n translator.</p>
                <p>Right-click the tab or tabset header to see translated context menus.</p>
            </div>
        );
    }
    return undefined;
};

const onContextMenu = (node: TabNode | TabSetNode | BorderNode | TabGroupNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    const items: PopupMenuEntry[] = new ContextMenuBuilder(node).addStandard().build();
    if (items.length === 0) {
        return;
    }
    showPopupMenu({
        anchor: { x: event.clientX, y: event.clientY },
        container: node.getLayoutRef()!,
        title: "Menu",
        items,
        onClose: () => {},
    });
};

function I18nExample() {
    const layoutRef = React.useRef<ILayoutApi>(null);
    const [lang, setLang] = React.useState("en");
    const translator = React.useMemo(() => getTranslator(lang), [lang]);

    // Redraw after the translator has been synced to the model
    const prevTranslator = React.useRef(translator);
    React.useEffect(() => {
        if (prevTranslator.current !== translator) {
            prevTranslator.current = translator;
            layoutRef.current?.redraw();
        }
    }, [translator]);

    return (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <ExampleHeader title="i18n" path="examples/i18n/I18n.tsx" source={sourceCode} />
            <div style={{ padding: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "gray" }}>Language:</span>
                {["en", "es", "de"].map((l) => (
                    <button key={l} onClick={() => setLang(l)} style={{ fontWeight: lang === l ? "bold" : "normal" }}>
                        {l.toUpperCase()}
                    </button>
                ))}
            </div>
            <div style={{ position: "relative", flexGrow: 1, border: "1px solid #ddd" }}>
                <Layout ref={layoutRef} model={model} factory={factory} i18nTranslator={translator} onContextMenu={onContextMenu} />
            </div>
        </div>
    );
}

const container = document.getElementById("container");
if (container) {
    createRoot(container).render(<I18nExample />);
}
`,f=i(),p={en:{"i18n.tab.welcome":`Welcome`,"i18n.tab.settings":`Settings`,"i18n.tab.about":`About`,"i18n.tab.profile":`Profile`,"i18n.group.general":`General`,"i18n.group.advanced":`Advanced`,"i18n.tabset.main":`Main Panel`,"flexlayout.ui.close.tab":`Close`,"flexlayout.ui.pinned.tab":`Pinned`,"flexlayout.ui.rename.tab":`Rename tab`,"flexlayout.ui.close.tabset":`Close tabset`,"flexlayout.ui.active.tabset":`Active tabset`,"flexlayout.ui.move.tabset":`Move tabset`,"flexlayout.ui.move.tabs (?)":`Move tabs (?)`,"flexlayout.ui.move.group (?)":`Move group (?)`,"flexlayout.ui.maximize.tabset":`Maximize tabset`,"flexlayout.ui.restore.tabset":`Restore tabset`,"flexlayout.ui.popout.tab":`Popout selected tab`,"flexlayout.ui.popout.tab.float":`Float selected tab`,"flexlayout.ui.popout.float.to.window":`Popout panel`,"flexlayout.ui.dock.float.to.layout":`Drag into another layout`,"flexlayout.ui.dock.float.tabs (?)":`Dock tabs (?)`,"flexlayout.ui.overflow.menu.tooltip":`Hidden tabs`,"flexlayout.ui.splitter":`Resize`,"flexlayout.ui.error.rendering.component":`Error rendering component`,"flexlayout.ui.error.rendering.component.retry":`Retry`,"flexlayout.ui.popout.window.name":`Popout Window`,"flexlayout.ui.menu.rename":`Rename`,"flexlayout.ui.menu.pin":`Pin`,"flexlayout.ui.menu.unpin":`Unpin`,"flexlayout.ui.menu.popout":`Popout`,"flexlayout.ui.menu.float":`Float`,"flexlayout.ui.menu.popout.tabset":`Pop out tabset`,"flexlayout.ui.menu.float.tabset":`Float tabset`,"flexlayout.ui.menu.maximize":`Maximize`,"flexlayout.ui.menu.restore":`Restore`,"flexlayout.ui.menu.overlay":`Overlay`,"flexlayout.ui.menu.split":`Split`,"flexlayout.ui.menu.close.all":`Close All`,"flexlayout.ui.menu.close.right":`Close to the Right`,"flexlayout.ui.menu.close.others":`Close Others`,"flexlayout.ui.menu.add.to.new.group":`Add to new group`,"flexlayout.ui.menu.add.to.group":`Add to group`,"flexlayout.ui.menu.remove.from.group":`Remove from group`,"flexlayout.ui.menu.ungroup":`Ungroup`,"flexlayout.ui.menu.expand":`Expand`,"flexlayout.ui.menu.collapse":`Collapse`,"flexlayout.ui.rename.group":`Rename group`,"flexlayout.ui.group.color":`Group color`,"flexlayout.ui.group.pill.tooltip":`Tab Group, click to expand/collapse`,"flexlayout.ui.group.name.label":`Name`,"flexlayout.ui.group.name.placeholder":`Group Name`,"flexlayout.ui.group.color.n":`Group color ?`,"flexlayout.ui.group.default.name":`Group`},es:{"i18n.tab.welcome":`Bienvenido`,"i18n.tab.settings":`Configuración`,"i18n.tab.about":`Acerca de`,"i18n.tab.profile":`Perfil`,"i18n.group.general":`General`,"i18n.group.advanced":`Avanzado`,"i18n.tabset.main":`Panel Principal`,"flexlayout.ui.close.tab":`Cerrar`,"flexlayout.ui.pinned.tab":`Fijado`,"flexlayout.ui.rename.tab":`Renomrar pestaña`,"flexlayout.ui.close.tabset":`Cerrar pestañas`,"flexlayout.ui.active.tabset":`Pestañas activas`,"flexlayout.ui.move.tabset":`Mover pestañas`,"flexlayout.ui.move.tabs (?)":`Mover pestañas (?)`,"flexlayout.ui.move.group (?)":`Mover grupo (?)`,"flexlayout.ui.maximize.tabset":`Maximizar pestañas`,"flexlayout.ui.restore.tabset":`Restaurar pestañas`,"flexlayout.ui.popout.tab":`Ventana con pestaña`,"flexlayout.ui.popout.tab.float":`Pestaña flotante`,"flexlayout.ui.popout.float.to.window":`Ventana`,"flexlayout.ui.dock.float.to.layout":`Arrastrar a otro diseño`,"flexlayout.ui.dock.float.tabs (?)":`Acoplar pestañas (?)`,"flexlayout.ui.overflow.menu.tooltip":`Pestañas ocultas`,"flexlayout.ui.splitter":`Redimensionar`,"flexlayout.ui.error.rendering.component":`Error al renderizar el componente`,"flexlayout.ui.error.rendering.component.retry":`Reintentar`,"flexlayout.ui.popout.window.name":`Ventana emergente`,"flexlayout.ui.menu.rename":`Renombrar`,"flexlayout.ui.menu.pin":`Fijar`,"flexlayout.ui.menu.unpin":`Desfijar`,"flexlayout.ui.menu.popout":`Ventana`,"flexlayout.ui.menu.float":`Flotante`,"flexlayout.ui.menu.popout.tabset":`Pestañas en ventana`,"flexlayout.ui.menu.float.tabset":`Pestañas flotantes`,"flexlayout.ui.menu.maximize":`Maximizar`,"flexlayout.ui.menu.restore":`Restaurar`,"flexlayout.ui.menu.overlay":`Superpuesto`,"flexlayout.ui.menu.split":`Dividir`,"flexlayout.ui.menu.close.all":`Cerrar todo`,"flexlayout.ui.menu.close.right":`Cerrar a la derecha`,"flexlayout.ui.menu.close.others":`Cerrar otros`,"flexlayout.ui.menu.add.to.new.group":`Agregar a nuevo grupo`,"flexlayout.ui.menu.add.to.group":`Agregar a grupo`,"flexlayout.ui.menu.remove.from.group":`Quitar del grupo`,"flexlayout.ui.menu.ungroup":`Desagrupar`,"flexlayout.ui.menu.expand":`Expandir`,"flexlayout.ui.menu.collapse":`Colapsar`,"flexlayout.ui.rename.group":`Renombrar grupo`,"flexlayout.ui.group.color":`Color del grupo`,"flexlayout.ui.group.pill.tooltip":`Grupo de pestañas, haga clic para expandir/colapsar`,"flexlayout.ui.group.name.label":`Nombre`,"flexlayout.ui.group.name.placeholder":`Nombre del grupo`,"flexlayout.ui.group.color.n":`Color del grupo ?`,"flexlayout.ui.group.default.name":`Grupo`},de:{"i18n.tab.welcome":`Willkommen`,"i18n.tab.settings":`Einstellungen`,"i18n.tab.about":`Über`,"i18n.tab.profile":`Profil`,"i18n.group.general":`Allgemein`,"i18n.group.advanced":`Erweitert`,"i18n.tabset.main":`Hauptpanel`,"flexlayout.ui.close.tab":`Schließen`,"flexlayout.ui.pinned.tab":`Angeheftet`,"flexlayout.ui.rename.tab":`Tab umbenennen`,"flexlayout.ui.close.tabset":`Tabs schließen`,"flexlayout.ui.active.tabset":`Aktiver Tabstreifen`,"flexlayout.ui.move.tabset":`Tabstreifen verschieben`,"flexlayout.ui.move.tabs (?)":`Tabs verschieben (?)`,"flexlayout.ui.move.group (?)":`Cluster verschieben (?)`,"flexlayout.ui.maximize.tabset":`Tabstreifen maximieren`,"flexlayout.ui.restore.tabset":`Tabstreifen wiederherstellen`,"flexlayout.ui.popout.tab":`Tab in Fenster öffnen`,"flexlayout.ui.popout.tab.float":`Tab schwebend machen`,"flexlayout.ui.popout.float.to.window":`Fenster`,"flexlayout.ui.dock.float.to.layout":`In anderes Layout ziehen`,"flexlayout.ui.dock.float.tabs (?)":`Tabs andocken (?)`,"flexlayout.ui.overflow.menu.tooltip":`Versteckte Tabs`,"flexlayout.ui.splitter":`Größe ändern`,"flexlayout.ui.error.rendering.component":`Fehler beim Rendern der Komponente`,"flexlayout.ui.error.rendering.component.retry":`Erneut versuchen`,"flexlayout.ui.popout.window.name":`Schwebendes Fenster`,"flexlayout.ui.menu.rename":`Umbenennen`,"flexlayout.ui.menu.pin":`Anheften`,"flexlayout.ui.menu.unpin":`Lösen`,"flexlayout.ui.menu.popout":`Fenster`,"flexlayout.ui.menu.float":`Schwebend`,"flexlayout.ui.menu.popout.tabset":`Tabs im Fenster`,"flexlayout.ui.menu.float.tabset":`Schwebende Tabs`,"flexlayout.ui.menu.maximize":`Maximieren`,"flexlayout.ui.menu.restore":`Wiederherstellen`,"flexlayout.ui.menu.overlay":`Überlagert`,"flexlayout.ui.menu.split":`Teilen`,"flexlayout.ui.menu.close.all":`Alle schließen`,"flexlayout.ui.menu.close.right":`Rechts schließen`,"flexlayout.ui.menu.close.others":`Andere schließen`,"flexlayout.ui.menu.add.to.new.group":`Zu neuem Cluster hinzufügen`,"flexlayout.ui.menu.add.to.group":`Zu Cluster hinzufügen`,"flexlayout.ui.menu.remove.from.group":`Aus Cluster entfernen`,"flexlayout.ui.menu.ungroup":`Cluster auflösen`,"flexlayout.ui.menu.expand":`Erweitern`,"flexlayout.ui.menu.collapse":`Zusammenklappen`,"flexlayout.ui.rename.group":`Cluster umbenennen`,"flexlayout.ui.group.color":`Clusterfarbe`,"flexlayout.ui.group.pill.tooltip":`Tab-Cluster, klicken zum Erweitern/Zusammenklappen`,"flexlayout.ui.group.name.label":`Name`,"flexlayout.ui.group.name.placeholder":`Clustername`,"flexlayout.ui.group.color.n":`Clusterfarbe ?`,"flexlayout.ui.group.default.name":`Cluster`}},m=n.fromJson({global:{tabEnableRename:!0,tabEnablePin:!0,tabSetEnableCloseButton:!0,tabSetEnableTabGroups:!0},layout:{type:`row`,children:[{type:`tabset`,id:`ts0`,name:`i18n.tabset.main`,weight:50,children:[{type:`tabgroup`,name:`i18n.group.general`,color:`#3b7de7`,children:[{type:`tab`,id:`t0`,name:`i18n.tab.welcome`,component:`panel`},{type:`tab`,id:`t1`,name:`i18n.tab.settings`,component:`panel`}]},{type:`tabgroup`,name:`i18n.group.advanced`,color:`#94b870`,children:[{type:`tab`,id:`t2`,name:`i18n.tab.about`,component:`panel`},{type:`tab`,id:`t3`,name:`i18n.tab.profile`,component:`panel`}]}]},{type:`tabset`,id:`ts1`,weight:50,children:[{type:`tab`,id:`t4`,name:`i18n.tab.welcome`,component:`panel`}]}]}}),h=e=>t=>p[e][t]??t,g=e=>{if(e.getComponent()===`panel`)return(0,f.jsxs)(`div`,{style:{padding:20},children:[(0,f.jsx)(`h2`,{children:e.getName()}),(0,f.jsx)(`p`,{children:`This tab's name is translated from the model via the i18n translator.`}),(0,f.jsx)(`p`,{children:`Right-click the tab or tabset header to see translated context menus.`})]})},_=(e,n)=>{n.preventDefault(),n.stopPropagation();let r=new c(e).addStandard().build();r.length!==0&&t({anchor:{x:n.clientX,y:n.clientY},container:e.getLayoutRef(),title:`Menu`,items:r,onClose:()=>{}})};function v(){let e=l.useRef(null),[t,n]=l.useState(`en`),i=l.useMemo(()=>h(t),[t]),o=l.useRef(i);return l.useEffect(()=>{o.current!==i&&(o.current=i,e.current?.redraw())},[i]),(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,right:0,bottom:0,display:`flex`,flexDirection:`column`,overflow:`hidden`},children:[(0,f.jsx)(a,{title:`i18n`,path:`examples/i18n/I18n.tsx`,source:d}),(0,f.jsxs)(`div`,{style:{padding:8,display:`flex`,gap:6,alignItems:`center`},children:[(0,f.jsx)(`span`,{style:{color:`gray`},children:`Language:`}),[`en`,`es`,`de`].map(e=>(0,f.jsx)(`button`,{onClick:()=>n(e),style:{fontWeight:t===e?`bold`:`normal`},children:e.toUpperCase()},e))]}),(0,f.jsx)(`div`,{style:{position:`relative`,flexGrow:1,border:`1px solid #ddd`},children:(0,f.jsx)(r,{ref:e,model:m,factory:g,i18nTranslator:i,onContextMenu:_})})]})}var y=document.getElementById(`container`);y&&(0,u.createRoot)(y).render((0,f.jsx)(v,{}));