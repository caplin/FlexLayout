export const additionalStyles  = [
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".flexlayout__layout { --color-text: black; --color-background: white; --color-base: white; --color-1: #f7f7f7; --color-2: #e6e6e6; --color-3: #d9d9d9; --color-4: #cccccc; --color-5: #bfbfbf; --color-6: #b3b3b3; --color-drag1: rgb(95, 134, 196); --color-drag2: rgb(119, 166, 119); --color-drag1-background: rgba(95, 134, 196, 0.1); --color-drag2-background: rgba(119, 166, 119, 0.075); --font-size: medium; --font-family: Roboto, Arial, sans-serif; --color-overflow: gray; --color-icon: gray; --color-tabset-background: var(--color-1); --color-tabset-background-selected: var(--color-1); --color-tabset-background-maximized: var(--color-6); --color-tabset-divider-line: var(--color-3); --color-tabset-header-background: var(--color-1); --color-tabset-header: var(--color-text); --color-border-background: var(--color-1); --color-border-divider-line: var(--color-3); --color-tab-selected: var(--color-text); --color-tab-selected-background: var(--color-3); --color-tab-unselected: gray; --color-tab-unselected-background: transparent; --color-tab-textbox: var(--color-text); --color-tab-textbox-background: var(--color-3); --color-border-tab-selected: var(--color-text); --color-border-tab-selected-background: var(--color-3); --color-border-tab-unselected: gray; --color-border-tab-unselected-background: var(--color-2); --color-splitter: var(--color-2); --color-splitter-hover: var(--color-4); --color-splitter-drag: var(--color-5); --color-drag-rect-border: var(--color-4); --color-drag-rect-background: var(--color-3); --color-drag-rect: var(--color-text); --color-popup-border: var(--color-6); --color-popup-unselected: var(--color-text); --color-popup-unselected-background: white; --color-popup-selected: var(--color-text); --color-popup-selected-background: var(--color-3); --color-edge-marker: #aaa; --color-edge-icon: #555; }",
          ".flexlayout__layout { inset: 0px; position: relative; border: 1px solid black; height: 90vh; }",
          ".flexlayout__splitter { background-color: var(--color-splitter); }",
          "@media (hover: hover) {\n  .flexlayout__splitter:hover { background-color: var(--color-splitter-hover); transition: background-color 0.1s ease-in 0.05s; }\n}",
          ".flexlayout__splitter_border { z-index: 10; }",
          ".flexlayout__splitter_drag { z-index: 1000; background-color: var(--color-splitter-drag); border-radius: 5px; }",
          ".flexlayout__splitter_extra { background-color: transparent; }",
          ".flexlayout__outline_rect { position: absolute; pointer-events: none; box-sizing: border-box; border: 2px solid var(--color-drag1); background: var(--color-drag1-background); border-radius: 5px; z-index: 1000; }",
          ".flexlayout__outline_rect_edge { pointer-events: none; border: 2px solid var(--color-drag2); background: var(--color-drag2-background); border-radius: 5px; z-index: 1000; box-sizing: border-box; }",
          ".flexlayout__edge_rect { position: absolute; z-index: 1000; background-color: var(--color-edge-marker); pointer-events: none; display: flex; align-items: center; justify-content: center; }",
          ".flexlayout__drag_rect { position: absolute; cursor: move; color: var(--color-drag-rect); background-color: var(--color-drag-rect-background); border: 2px solid var(--color-drag-rect-border); border-radius: 5px; z-index: 1000; box-sizing: border-box; opacity: 0.9; text-align: center; display: flex; justify-content: center; flex-direction: column; overflow: hidden; padding: 0.3em 1em; overflow-wrap: break-word; font-size: var(--font-size); font-family: var(--font-family); }",
          ".flexlayout__tabset { display: flex; flex-direction: column; overflow: hidden; background-color: var(--color-tabset-background); box-sizing: border-box; font-size: var(--font-size); font-family: var(--font-family); }",
          ".flexlayout__tabset_tab_divider { width: 4px; }",
          ".flexlayout__tabset_content { display: flex; flex-grow: 1; align-items: center; justify-content: center; }",
          ".flexlayout__tabset_header { display: flex; align-items: center; padding: 3px 3px 3px 5px; box-sizing: border-box; border-bottom: 1px solid var(--color-tabset-divider-line); color: var(--color-tabset-header); background-color: var(--color-tabset-header-background); box-shadow: rgba(136, 136, 136, 0.54) 0px 0px 3px 0px inset; }",
          ".flexlayout__tabset_header_content { flex-grow: 1; }",
          ".flexlayout__tabset_tabbar_outer { box-sizing: border-box; background-color: var(--color-tabset-background); overflow: hidden; display: flex; }",
          ".flexlayout__tabset_tabbar_outer_top { border-bottom: 1px solid var(--color-tabset-divider-line); }",
          ".flexlayout__tabset_tabbar_outer_bottom { border-top: 1px solid var(--color-tabset-divider-line); }",
          ".flexlayout__tabset_tabbar_inner { position: relative; box-sizing: border-box; display: flex; flex-grow: 1; overflow: hidden; }",
          ".flexlayout__tabset_tabbar_inner_tab_container { display: flex; padding-left: 4px; padding-right: 4px; box-sizing: border-box; position: absolute; top: 0px; bottom: 0px; width: 10000px; }",
          ".flexlayout__tabset_tabbar_inner_tab_container_top { border-top: 2px solid transparent; }",
          ".flexlayout__tabset_tabbar_inner_tab_container_bottom { border-bottom: 2px solid transparent; }",
          ".flexlayout__tabset-selected { background-color: var(--color-tabset-background-selected); background-image: linear-gradient(var(--color-background), var(--color-4)); }",
          ".flexlayout__tabset-maximized { background-color: var(--color-tabset-background-maximized); background-image: linear-gradient(var(--color-6), var(--color-2)); }",
          ".flexlayout__tab_button_stamp { display: inline-flex; align-items: center; gap: 0.3em; white-space: nowrap; box-sizing: border-box; }",
          ".flexlayout__tab { overflow: auto; position: absolute; box-sizing: border-box; background-color: var(--color-background); color: var(--color-text); }",
          ".flexlayout__tab_button { display: flex; gap: 0.3em; align-items: center; box-sizing: border-box; padding: 3px 0.5em; cursor: pointer; }",
          ".flexlayout__tab_button_stretch { background-color: transparent; color: var(--color-tab-selected); width: 100%; padding: 3px 0em; text-wrap: nowrap; display: flex; gap: 0.3em; align-items: center; box-sizing: border-box; cursor: pointer; }",
          "@media (hover: hover) {\n  .flexlayout__tab_button_stretch:hover { color: var(--color-tab-selected); }\n}",
          ".flexlayout__tab_button--selected { background-color: var(--color-tab-selected-background); color: var(--color-tab-selected); }",
          "@media (hover: hover) {\n  .flexlayout__tab_button:hover { background-color: var(--color-tab-selected-background); color: var(--color-tab-selected); }\n}",
          ".flexlayout__tab_button--unselected { background-color: var(--color-tab-unselected-background); color: var(--color-tab-unselected); }",
          ".flexlayout__tab_button_top { box-shadow: rgba(0, 0, 0, 0.1) -2px 0px 5px inset; border-top-left-radius: 3px; border-top-right-radius: 3px; }",
          ".flexlayout__tab_button_bottom { box-shadow: rgba(0, 0, 0, 0.1) -2px 0px 5px inset; border-bottom-left-radius: 3px; border-bottom-right-radius: 3px; }",
          ".flexlayout__tab_button_leading { display: flex; }",
          ".flexlayout__tab_button_content { display: flex; }",
          ".flexlayout__tab_button_textbox { font-family: var(--font-family); font-size: var(--font-size); color: var(--color-tab-textbox); background-color: var(--color-tab-textbox-background); border: 1px inset var(--color-1); border-radius: 3px; width: 10em; }",
          ".flexlayout__tab_button_textbox:focus { outline: none; }",
          ".flexlayout__tab_button_trailing { display: flex; visibility: hidden; border-radius: 4px; }",
          "@media (hover: hover) {\n  .flexlayout__tab_button:hover .flexlayout__tab_button_trailing { visibility: visible; }\n}",
          ".flexlayout__tab_button--selected .flexlayout__tab_button_trailing { visibility: visible; }",
          ".flexlayout__tab_button_overflow { display: flex; align-items: center; border: none; color: var(--color-overflow); font-size: inherit; background-color: transparent; }",
          ".flexlayout__tab_toolbar { display: flex; align-items: center; gap: 0.3em; padding-left: 0.5em; padding-right: 0.3em; }",
          ".flexlayout__tab_toolbar_button { border: none; outline: none; font-size: inherit; margin: 0px; background-color: transparent; border-radius: 4px; padding: 1px; }",
          ".flexlayout__tab_toolbar_sticky_buttons_container { display: flex; gap: 0.3em; padding-left: 5px; align-items: center; }",
          ".flexlayout__tab_floating { overflow: auto; position: absolute; box-sizing: border-box; color: var(--color-text); background-color: var(--color-background); display: flex; justify-content: center; align-items: center; }",
          ".flexlayout__tab_floating_inner { overflow: auto; display: flex; flex-direction: column; justify-content: center; align-items: center; }",
          ".flexlayout__tab_floating_inner div { margin-bottom: 5px; text-align: center; }",
          ".flexlayout__tab_floating_inner div a { color: royalblue; }",
          ".flexlayout__border { box-sizing: border-box; overflow: hidden; display: flex; font-size: var(--font-size); font-family: var(--font-family); color: var(--color-border); background-color: var(--color-border-background); }",
          ".flexlayout__border_top { border-bottom: 1px solid var(--color-border-divider-line); align-items: center; }",
          ".flexlayout__border_bottom { border-top: 1px solid var(--color-border-divider-line); align-items: center; }",
          ".flexlayout__border_left { border-right: 1px solid var(--color-border-divider-line); align-content: center; flex-direction: column; }",
          ".flexlayout__border_right { border-left: 1px solid var(--color-border-divider-line); align-content: center; flex-direction: column; }",
          ".flexlayout__border_inner { position: relative; box-sizing: border-box; display: flex; overflow: hidden; flex-grow: 1; }",
          ".flexlayout__border_inner_tab_container { white-space: nowrap; display: flex; padding-left: 2px; padding-right: 2px; box-sizing: border-box; position: absolute; top: 0px; bottom: 0px; width: 10000px; }",
          ".flexlayout__border_inner_tab_container_right { transform-origin: left top; transform: rotate(90deg); }",
          ".flexlayout__border_inner_tab_container_left { flex-direction: row-reverse; transform-origin: right top; transform: rotate(-90deg); }",
          ".flexlayout__border_tab_divider { width: 4px; }",
          ".flexlayout__border_button { display: flex; gap: 0.3em; align-items: center; cursor: pointer; padding: 3px 0.5em; margin: 2px 0px; box-sizing: border-box; white-space: nowrap; box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 5px inset; border-radius: 3px; }",
          ".flexlayout__border_button--selected { background-color: var(--color-border-tab-selected-background); color: var(--color-border-tab-selected); }",
          "@media (hover: hover) {\n  .flexlayout__border_button:hover { background-color: var(--color-border-tab-selected-background); color: var(--color-border-tab-selected); }\n}",
          ".flexlayout__border_button--unselected { background-color: var(--color-border-tab-unselected-background); color: var(--color-border-tab-unselected); }",
          ".flexlayout__border_button_leading { display: flex; }",
          ".flexlayout__border_button_content { display: flex; }",
          ".flexlayout__border_button_trailing { display: flex; border-radius: 4px; visibility: hidden; }",
          "@media (hover: hover) {\n  .flexlayout__border_button:hover .flexlayout__border_button_trailing { visibility: visible; }\n}",
          ".flexlayout__border_button--selected .flexlayout__border_button_trailing { visibility: visible; }",
          ".flexlayout__border_toolbar { display: flex; gap: 0.3em; align-items: center; }",
          ".flexlayout__border_toolbar_left, .flexlayout__border_toolbar_right { flex-direction: column; padding-top: 0.5em; padding-bottom: 0.3em; }",
          ".flexlayout__border_toolbar_top, .flexlayout__border_toolbar_bottom { padding-left: 0.5em; padding-right: 0.3em; }",
          ".flexlayout__border_toolbar_button { border: none; outline: none; font-size: inherit; background-color: transparent; border-radius: 4px; padding: 1px; }",
          ".flexlayout__border_toolbar_button_overflow { display: flex; align-items: center; border: none; color: var(--color-overflow); font-size: inherit; background-color: transparent; }",
          ".flexlayout__popup_menu { font-size: var(--font-size); font-family: var(--font-family); }",
          ".flexlayout__popup_menu_item { padding: 2px 0.5em; white-space: nowrap; cursor: pointer; border-radius: 2px; }",
          "@media (hover: hover) {\n  .flexlayout__popup_menu_item:hover { background-color: var(--color-6); }\n}",
          ".flexlayout__popup_menu_container { box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 5px inset; border: 1px solid var(--color-popup-border); color: var(--color-popup-unselected); background: var(--color-popup-unselected-background); border-radius: 3px; position: absolute; z-index: 1000; max-height: 50%; min-width: 100px; overflow: auto; padding: 2px; }",
          ".flexlayout__floating_window _body { height: 100%; }",
          ".flexlayout__floating_window_content { inset: 0px; position: absolute; }",
          ".flexlayout__floating_window_tab { overflow: auto; inset: 0px; position: absolute; box-sizing: border-box; background-color: var(--color-background); color: var(--color-text); }",
          ".flexlayout__error_boundary_container { inset: 0px; position: absolute; display: flex; justify-content: center; }",
          ".flexlayout__error_boundary_content { display: flex; align-items: center; }",
          ".flexlayout__tabset_sizer { padding-top: 5px; padding-bottom: 3px; font-size: var(--font-size); font-family: var(--font-family); }",
          ".flexlayout__tabset_header_sizer { padding-top: 3px; padding-bottom: 3px; font-size: var(--font-size); font-family: var(--font-family); }",
          ".flexlayout__border_sizer { padding-top: 6px; padding-bottom: 5px; font-size: var(--font-size); font-family: var(--font-family); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":host, :root, [data-theme] { --chakra-ring-inset: var(--chakra-empty,/*!*/ /*!*/); --chakra-ring-offset-width: 0px; --chakra-ring-offset-color: #fff; --chakra-ring-color: rgba(66, 153, 225, 0.6); --chakra-ring-offset-shadow: 0 0 #0000; --chakra-ring-shadow: 0 0 #0000; --chakra-space-x-reverse: 0; --chakra-space-y-reverse: 0; --chakra-colors-transparent: transparent; --chakra-colors-current: currentColor; --chakra-colors-black: #000000; --chakra-colors-white: #FFFFFF; --chakra-colors-whiteAlpha-50: rgba(255, 255, 255, 0.04); --chakra-colors-whiteAlpha-100: rgba(255, 255, 255, 0.06); --chakra-colors-whiteAlpha-200: rgba(255, 255, 255, 0.08); --chakra-colors-whiteAlpha-300: rgba(255, 255, 255, 0.16); --chakra-colors-whiteAlpha-400: rgba(255, 255, 255, 0.24); --chakra-colors-whiteAlpha-500: rgba(255, 255, 255, 0.36); --chakra-colors-whiteAlpha-600: rgba(255, 255, 255, 0.48); --chakra-colors-whiteAlpha-700: rgba(255, 255, 255, 0.64); --chakra-colors-whiteAlpha-800: rgba(255, 255, 255, 0.80); --chakra-colors-whiteAlpha-900: rgba(255, 255, 255, 0.92); --chakra-colors-blackAlpha-50: rgba(0, 0, 0, 0.04); --chakra-colors-blackAlpha-100: rgba(0, 0, 0, 0.06); --chakra-colors-blackAlpha-200: rgba(0, 0, 0, 0.08); --chakra-colors-blackAlpha-300: rgba(0, 0, 0, 0.16); --chakra-colors-blackAlpha-400: rgba(0, 0, 0, 0.24); --chakra-colors-blackAlpha-500: rgba(0, 0, 0, 0.36); --chakra-colors-blackAlpha-600: rgba(0, 0, 0, 0.48); --chakra-colors-blackAlpha-700: rgba(0, 0, 0, 0.64); --chakra-colors-blackAlpha-800: rgba(0, 0, 0, 0.80); --chakra-colors-blackAlpha-900: rgba(0, 0, 0, 0.92); --chakra-colors-gray-50: #F7FAFC; --chakra-colors-gray-100: #EDF2F7; --chakra-colors-gray-200: #E2E8F0; --chakra-colors-gray-300: #CBD5E0; --chakra-colors-gray-400: #A0AEC0; --chakra-colors-gray-500: #718096; --chakra-colors-gray-600: #4A5568; --chakra-colors-gray-700: #2D3748; --chakra-colors-gray-800: #1A202C; --chakra-colors-gray-900: #171923; --chakra-colors-red-50: #FFF5F5; --chakra-colors-red-100: #FED7D7; --chakra-colors-red-200: #FEB2B2; --chakra-colors-red-300: #FC8181; --chakra-colors-red-400: #F56565; --chakra-colors-red-500: #E53E3E; --chakra-colors-red-600: #C53030; --chakra-colors-red-700: #9B2C2C; --chakra-colors-red-800: #822727; --chakra-colors-red-900: #63171B; --chakra-colors-orange-50: #FFFAF0; --chakra-colors-orange-100: #FEEBC8; --chakra-colors-orange-200: #FBD38D; --chakra-colors-orange-300: #F6AD55; --chakra-colors-orange-400: #ED8936; --chakra-colors-orange-500: #DD6B20; --chakra-colors-orange-600: #C05621; --chakra-colors-orange-700: #9C4221; --chakra-colors-orange-800: #7B341E; --chakra-colors-orange-900: #652B19; --chakra-colors-yellow-50: #FFFFF0; --chakra-colors-yellow-100: #FEFCBF; --chakra-colors-yellow-200: #FAF089; --chakra-colors-yellow-300: #F6E05E; --chakra-colors-yellow-400: #ECC94B; --chakra-colors-yellow-500: #D69E2E; --chakra-colors-yellow-600: #B7791F; --chakra-colors-yellow-700: #975A16; --chakra-colors-yellow-800: #744210; --chakra-colors-yellow-900: #5F370E; --chakra-colors-green-50: #F0FFF4; --chakra-colors-green-100: #C6F6D5; --chakra-colors-green-200: #9AE6B4; --chakra-colors-green-300: #68D391; --chakra-colors-green-400: #48BB78; --chakra-colors-green-500: #38A169; --chakra-colors-green-600: #2F855A; --chakra-colors-green-700: #276749; --chakra-colors-green-800: #22543D; --chakra-colors-green-900: #1C4532; --chakra-colors-teal-50: #E6FFFA; --chakra-colors-teal-100: #B2F5EA; --chakra-colors-teal-200: #81E6D9; --chakra-colors-teal-300: #4FD1C5; --chakra-colors-teal-400: #38B2AC; --chakra-colors-teal-500: #319795; --chakra-colors-teal-600: #2C7A7B; --chakra-colors-teal-700: #285E61; --chakra-colors-teal-800: #234E52; --chakra-colors-teal-900: #1D4044; --chakra-colors-blue-50: #ebf8ff; --chakra-colors-blue-100: #bee3f8; --chakra-colors-blue-200: #90cdf4; --chakra-colors-blue-300: #63b3ed; --chakra-colors-blue-400: #4299e1; --chakra-colors-blue-500: #3182ce; --chakra-colors-blue-600: #2b6cb0; --chakra-colors-blue-700: #2c5282; --chakra-colors-blue-800: #2a4365; --chakra-colors-blue-900: #1A365D; --chakra-colors-cyan-50: #EDFDFD; --chakra-colors-cyan-100: #C4F1F9; --chakra-colors-cyan-200: #9DECF9; --chakra-colors-cyan-300: #76E4F7; --chakra-colors-cyan-400: #0BC5EA; --chakra-colors-cyan-500: #00B5D8; --chakra-colors-cyan-600: #00A3C4; --chakra-colors-cyan-700: #0987A0; --chakra-colors-cyan-800: #086F83; --chakra-colors-cyan-900: #065666; --chakra-colors-purple-50: #FAF5FF; --chakra-colors-purple-100: #E9D8FD; --chakra-colors-purple-200: #D6BCFA; --chakra-colors-purple-300: #B794F4; --chakra-colors-purple-400: #9F7AEA; --chakra-colors-purple-500: #805AD5; --chakra-colors-purple-600: #6B46C1; --chakra-colors-purple-700: #553C9A; --chakra-colors-purple-800: #44337A; --chakra-colors-purple-900: #322659; --chakra-colors-pink-50: #FFF5F7; --chakra-colors-pink-100: #FED7E2; --chakra-colors-pink-200: #FBB6CE; --chakra-colors-pink-300: #F687B3; --chakra-colors-pink-400: #ED64A6; --chakra-colors-pink-500: #D53F8C; --chakra-colors-pink-600: #B83280; --chakra-colors-pink-700: #97266D; --chakra-colors-pink-800: #702459; --chakra-colors-pink-900: #521B41; --chakra-colors-linkedin-50: #E8F4F9; --chakra-colors-linkedin-100: #CFEDFB; --chakra-colors-linkedin-200: #9BDAF3; --chakra-colors-linkedin-300: #68C7EC; --chakra-colors-linkedin-400: #34B3E4; --chakra-colors-linkedin-500: #00A0DC; --chakra-colors-linkedin-600: #008CC9; --chakra-colors-linkedin-700: #0077B5; --chakra-colors-linkedin-800: #005E93; --chakra-colors-linkedin-900: #004471; --chakra-colors-facebook-50: #E8F4F9; --chakra-colors-facebook-100: #D9DEE9; --chakra-colors-facebook-200: #B7C2DA; --chakra-colors-facebook-300: #6482C0; --chakra-colors-facebook-400: #4267B2; --chakra-colors-facebook-500: #385898; --chakra-colors-facebook-600: #314E89; --chakra-colors-facebook-700: #29487D; --chakra-colors-facebook-800: #223B67; --chakra-colors-facebook-900: #1E355B; --chakra-colors-messenger-50: #D0E6FF; --chakra-colors-messenger-100: #B9DAFF; --chakra-colors-messenger-200: #A2CDFF; --chakra-colors-messenger-300: #7AB8FF; --chakra-colors-messenger-400: #2E90FF; --chakra-colors-messenger-500: #0078FF; --chakra-colors-messenger-600: #0063D1; --chakra-colors-messenger-700: #0052AC; --chakra-colors-messenger-800: #003C7E; --chakra-colors-messenger-900: #002C5C; --chakra-colors-whatsapp-50: #dffeec; --chakra-colors-whatsapp-100: #b9f5d0; --chakra-colors-whatsapp-200: #90edb3; --chakra-colors-whatsapp-300: #65e495; --chakra-colors-whatsapp-400: #3cdd78; --chakra-colors-whatsapp-500: #22c35e; --chakra-colors-whatsapp-600: #179848; --chakra-colors-whatsapp-700: #0c6c33; --chakra-colors-whatsapp-800: #01421c; --chakra-colors-whatsapp-900: #001803; --chakra-colors-twitter-50: #E5F4FD; --chakra-colors-twitter-100: #C8E9FB; --chakra-colors-twitter-200: #A8DCFA; --chakra-colors-twitter-300: #83CDF7; --chakra-colors-twitter-400: #57BBF5; --chakra-colors-twitter-500: #1DA1F2; --chakra-colors-twitter-600: #1A94DA; --chakra-colors-twitter-700: #1681BF; --chakra-colors-twitter-800: #136B9E; --chakra-colors-twitter-900: #0D4D71; --chakra-colors-telegram-50: #E3F2F9; --chakra-colors-telegram-100: #C5E4F3; --chakra-colors-telegram-200: #A2D4EC; --chakra-colors-telegram-300: #7AC1E4; --chakra-colors-telegram-400: #47A9DA; --chakra-colors-telegram-500: #0088CC; --chakra-colors-telegram-600: #007AB8; --chakra-colors-telegram-700: #006BA1; --chakra-colors-telegram-800: #005885; --chakra-colors-telegram-900: #003F5E; --chakra-borders-none: 0; --chakra-borders-1px: 1px solid; --chakra-borders-2px: 2px solid; --chakra-borders-4px: 4px solid; --chakra-borders-8px: 8px solid; --chakra-fonts-heading: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\"; --chakra-fonts-body: -apple-system,BlinkMacSystemFont,\"Segoe UI\",Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\"; --chakra-fonts-mono: SFMono-Regular,Menlo,Monaco,Consolas,\"Liberation Mono\",\"Courier New\",monospace; --chakra-fontSizes-3xs: 0.45rem; --chakra-fontSizes-2xs: 0.625rem; --chakra-fontSizes-xs: 0.75rem; --chakra-fontSizes-sm: 0.875rem; --chakra-fontSizes-md: 1rem; --chakra-fontSizes-lg: 1.125rem; --chakra-fontSizes-xl: 1.25rem; --chakra-fontSizes-2xl: 1.5rem; --chakra-fontSizes-3xl: 1.875rem; --chakra-fontSizes-4xl: 2.25rem; --chakra-fontSizes-5xl: 3rem; --chakra-fontSizes-6xl: 3.75rem; --chakra-fontSizes-7xl: 4.5rem; --chakra-fontSizes-8xl: 6rem; --chakra-fontSizes-9xl: 8rem; --chakra-fontWeights-hairline: 100; --chakra-fontWeights-thin: 200; --chakra-fontWeights-light: 300; --chakra-fontWeights-normal: 400; --chakra-fontWeights-medium: 500; --chakra-fontWeights-semibold: 600; --chakra-fontWeights-bold: 700; --chakra-fontWeights-extrabold: 800; --chakra-fontWeights-black: 900; --chakra-letterSpacings-tighter: -0.05em; --chakra-letterSpacings-tight: -0.025em; --chakra-letterSpacings-normal: 0; --chakra-letterSpacings-wide: 0.025em; --chakra-letterSpacings-wider: 0.05em; --chakra-letterSpacings-widest: 0.1em; --chakra-lineHeights-3: .75rem; --chakra-lineHeights-4: 1rem; --chakra-lineHeights-5: 1.25rem; --chakra-lineHeights-6: 1.5rem; --chakra-lineHeights-7: 1.75rem; --chakra-lineHeights-8: 2rem; --chakra-lineHeights-9: 2.25rem; --chakra-lineHeights-10: 2.5rem; --chakra-lineHeights-normal: normal; --chakra-lineHeights-none: 1; --chakra-lineHeights-shorter: 1.25; --chakra-lineHeights-short: 1.375; --chakra-lineHeights-base: 1.5; --chakra-lineHeights-tall: 1.625; --chakra-lineHeights-taller: 2; --chakra-radii-none: 0; --chakra-radii-sm: 0.125rem; --chakra-radii-base: 0.25rem; --chakra-radii-md: 0.375rem; --chakra-radii-lg: 0.5rem; --chakra-radii-xl: 0.75rem; --chakra-radii-2xl: 1rem; --chakra-radii-3xl: 1.5rem; --chakra-radii-full: 9999px; --chakra-space-1: 0.25rem; --chakra-space-2: 0.5rem; --chakra-space-3: 0.75rem; --chakra-space-4: 1rem; --chakra-space-5: 1.25rem; --chakra-space-6: 1.5rem; --chakra-space-7: 1.75rem; --chakra-space-8: 2rem; --chakra-space-9: 2.25rem; --chakra-space-10: 2.5rem; --chakra-space-12: 3rem; --chakra-space-14: 3.5rem; --chakra-space-16: 4rem; --chakra-space-20: 5rem; --chakra-space-24: 6rem; --chakra-space-28: 7rem; --chakra-space-32: 8rem; --chakra-space-36: 9rem; --chakra-space-40: 10rem; --chakra-space-44: 11rem; --chakra-space-48: 12rem; --chakra-space-52: 13rem; --chakra-space-56: 14rem; --chakra-space-60: 15rem; --chakra-space-64: 16rem; --chakra-space-72: 18rem; --chakra-space-80: 20rem; --chakra-space-96: 24rem; --chakra-space-px: 1px; --chakra-space-0-5: 0.125rem; --chakra-space-1-5: 0.375rem; --chakra-space-2-5: 0.625rem; --chakra-space-3-5: 0.875rem; --chakra-shadows-xs: 0 0 0 1px rgba(0, 0, 0, 0.05); --chakra-shadows-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05); --chakra-shadows-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px 0 rgba(0, 0, 0, 0.06); --chakra-shadows-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),0 2px 4px -1px rgba(0, 0, 0, 0.06); --chakra-shadows-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05); --chakra-shadows-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),0 10px 10px -5px rgba(0, 0, 0, 0.04); --chakra-shadows-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25); --chakra-shadows-outline: 0 0 0 3px rgba(66, 153, 225, 0.6); --chakra-shadows-inner: inset 0 2px 4px 0 rgba(0,0,0,0.06); --chakra-shadows-none: none; --chakra-shadows-dark-lg: rgba(0, 0, 0, 0.1) 0px 0px 0px 1px,rgba(0, 0, 0, 0.2) 0px 5px 10px,rgba(0, 0, 0, 0.4) 0px 15px 40px; --chakra-sizes-1: 0.25rem; --chakra-sizes-2: 0.5rem; --chakra-sizes-3: 0.75rem; --chakra-sizes-4: 1rem; --chakra-sizes-5: 1.25rem; --chakra-sizes-6: 1.5rem; --chakra-sizes-7: 1.75rem; --chakra-sizes-8: 2rem; --chakra-sizes-9: 2.25rem; --chakra-sizes-10: 2.5rem; --chakra-sizes-12: 3rem; --chakra-sizes-14: 3.5rem; --chakra-sizes-16: 4rem; --chakra-sizes-20: 5rem; --chakra-sizes-24: 6rem; --chakra-sizes-28: 7rem; --chakra-sizes-32: 8rem; --chakra-sizes-36: 9rem; --chakra-sizes-40: 10rem; --chakra-sizes-44: 11rem; --chakra-sizes-48: 12rem; --chakra-sizes-52: 13rem; --chakra-sizes-56: 14rem; --chakra-sizes-60: 15rem; --chakra-sizes-64: 16rem; --chakra-sizes-72: 18rem; --chakra-sizes-80: 20rem; --chakra-sizes-96: 24rem; --chakra-sizes-px: 1px; --chakra-sizes-0-5: 0.125rem; --chakra-sizes-1-5: 0.375rem; --chakra-sizes-2-5: 0.625rem; --chakra-sizes-3-5: 0.875rem; --chakra-sizes-max: max-content; --chakra-sizes-min: min-content; --chakra-sizes-full: 100%; --chakra-sizes-3xs: 14rem; --chakra-sizes-2xs: 16rem; --chakra-sizes-xs: 20rem; --chakra-sizes-sm: 24rem; --chakra-sizes-md: 28rem; --chakra-sizes-lg: 32rem; --chakra-sizes-xl: 36rem; --chakra-sizes-2xl: 42rem; --chakra-sizes-3xl: 48rem; --chakra-sizes-4xl: 56rem; --chakra-sizes-5xl: 64rem; --chakra-sizes-6xl: 72rem; --chakra-sizes-7xl: 80rem; --chakra-sizes-8xl: 90rem; --chakra-sizes-prose: 60ch; --chakra-sizes-container-sm: 640px; --chakra-sizes-container-md: 768px; --chakra-sizes-container-lg: 1024px; --chakra-sizes-container-xl: 1280px; --chakra-zIndices-hide: -1; --chakra-zIndices-auto: auto; --chakra-zIndices-base: 0; --chakra-zIndices-docked: 10; --chakra-zIndices-dropdown: 1000; --chakra-zIndices-sticky: 1100; --chakra-zIndices-banner: 1200; --chakra-zIndices-overlay: 1300; --chakra-zIndices-modal: 1400; --chakra-zIndices-popover: 1500; --chakra-zIndices-skipLink: 1600; --chakra-zIndices-toast: 1700; --chakra-zIndices-tooltip: 1800; --chakra-transition-property-common: background-color,border-color,color,fill,stroke,opacity,box-shadow,transform; --chakra-transition-property-colors: background-color,border-color,color,fill,stroke; --chakra-transition-property-dimensions: width,height; --chakra-transition-property-position: left,right,top,bottom; --chakra-transition-property-background: background-color,background-image,background-position; --chakra-transition-easing-ease-in: cubic-bezier(0.4, 0, 1, 1); --chakra-transition-easing-ease-out: cubic-bezier(0, 0, 0.2, 1); --chakra-transition-easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); --chakra-transition-duration-ultra-fast: 50ms; --chakra-transition-duration-faster: 100ms; --chakra-transition-duration-fast: 150ms; --chakra-transition-duration-normal: 200ms; --chakra-transition-duration-slow: 300ms; --chakra-transition-duration-slower: 400ms; --chakra-transition-duration-ultra-slow: 500ms; --chakra-blur-none: 0; --chakra-blur-sm: 4px; --chakra-blur-base: 8px; --chakra-blur-md: 12px; --chakra-blur-lg: 16px; --chakra-blur-xl: 24px; --chakra-blur-2xl: 40px; --chakra-blur-3xl: 64px; --chakra-breakpoints-base: 0em; --chakra-breakpoints-sm: 30em; --chakra-breakpoints-md: 48em; --chakra-breakpoints-lg: 62em; --chakra-breakpoints-xl: 80em; --chakra-breakpoints-2xl: 96em; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-ui-light :host:not([data-theme]), .chakra-ui-light :root:not([data-theme]), .chakra-ui-light [data-theme]:not([data-theme]), [data-theme=\"light\"] :host:not([data-theme]), [data-theme=\"light\"] :root:not([data-theme]), [data-theme=\"light\"] [data-theme]:not([data-theme]), :host[data-theme=\"light\"], :root[data-theme=\"light\"], [data-theme][data-theme=\"light\"] { --chakra-colors-chakra-body-text: var(--chakra-colors-gray-800); --chakra-colors-chakra-body-bg: var(--chakra-colors-white); --chakra-colors-chakra-border-color: var(--chakra-colors-gray-200); --chakra-colors-chakra-inverse-text: var(--chakra-colors-white); --chakra-colors-chakra-subtle-bg: var(--chakra-colors-gray-100); --chakra-colors-chakra-subtle-text: var(--chakra-colors-gray-600); --chakra-colors-chakra-placeholder-color: var(--chakra-colors-gray-500); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-ui-dark :host:not([data-theme]), .chakra-ui-dark :root:not([data-theme]), .chakra-ui-dark [data-theme]:not([data-theme]), [data-theme=\"dark\"] :host:not([data-theme]), [data-theme=\"dark\"] :root:not([data-theme]), [data-theme=\"dark\"] [data-theme]:not([data-theme]), :host[data-theme=\"dark\"], :root[data-theme=\"dark\"], [data-theme][data-theme=\"dark\"] { --chakra-colors-chakra-body-text: var(--chakra-colors-whiteAlpha-900); --chakra-colors-chakra-body-bg: var(--chakra-colors-gray-800); --chakra-colors-chakra-border-color: var(--chakra-colors-whiteAlpha-300); --chakra-colors-chakra-inverse-text: var(--chakra-colors-gray-800); --chakra-colors-chakra-subtle-bg: var(--chakra-colors-gray-700); --chakra-colors-chakra-subtle-text: var(--chakra-colors-gray-400); --chakra-colors-chakra-placeholder-color: var(--chakra-colors-whiteAlpha-400); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "html { line-height: 1.5; text-size-adjust: 100%; font-family: system-ui, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizelegibility; touch-action: manipulation; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "body { position: relative; min-height: 100%; margin: 0px; font-feature-settings: \"kern\"; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(*) { border-width: 0px; border-style: solid; box-sizing: border-box; overflow-wrap: break-word; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "main { display: block; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "hr { border-top-width: 1px; box-sizing: content-box; height: 0px; overflow: visible; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(pre, code, kbd, samp) { font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 1em; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "a { background-color: transparent; color: inherit; text-decoration: inherit; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "abbr[title] { border-bottom: none; text-decoration: underline dotted; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(b, strong) { font-weight: bold; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "small { font-size: 80%; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(sub, sup) { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "sub { bottom: -0.25em; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "sup { top: -0.5em; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "img { border-style: none; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(button, input, optgroup, select, textarea) { font-family: inherit; font-size: 100%; line-height: 1.15; margin: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(button, input) { overflow: visible; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(button, select) { text-transform: none; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where() { border-style: none; padding: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "fieldset { padding: 0.35em 0.75em 0.625em; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "legend { box-sizing: border-box; color: inherit; display: table; max-width: 100%; padding: 0px; white-space: normal; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "progress { vertical-align: baseline; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "textarea { overflow: auto; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where([type=\"checkbox\"], [type=\"radio\"]) { box-sizing: border-box; padding: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "input[type=\"number\"]::-webkit-inner-spin-button, input[type=\"number\"]::-webkit-outer-spin-button { appearance: none !important; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "input[type=\"number\"] { }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "input[type=\"search\"] { appearance: textfield; outline-offset: -2px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "input[type=\"search\"]::-webkit-search-decoration { appearance: none !important; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "::-webkit-file-upload-button { appearance: button; font: inherit; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "details { display: block; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "summary { display: list-item; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "template { display: none; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "[hidden] { display: none !important; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(blockquote, dl, dd, h1, h2, h3, h4, h5, h6, hr, figure, p, pre) { margin: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "button { background: transparent; padding: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "fieldset { margin: 0px; padding: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(ol, ul) { margin: 0px; padding: 0px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "textarea { resize: vertical; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(button, [role=\"button\"]) { cursor: pointer; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": []
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "table { border-collapse: collapse; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(h1, h2, h3, h4, h5, h6) { font-size: inherit; font-weight: inherit; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(button, input, optgroup, select, textarea) { padding: 0px; line-height: inherit; color: inherit; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(img, svg, video, canvas, audio, iframe, embed, object) { display: block; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":where(img, video) { max-width: 100%; height: auto; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "[data-js-focus-visible] :focus:not([data-focus-visible-added]):not([data-focus-visible-disabled]) { outline: none; box-shadow: none; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": []
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ":root, :host { --chakra-vh: 100vh; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "@supports (height: -webkit-fill-available) {\n  :root, :host { --chakra-vh: -webkit-fill-available; }\n}"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "@supports (height: -moz-fill-available) {\n  :root, :host { --chakra-vh: -moz-fill-available; }\n}"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "@supports (height: 100dvh) {\n  :root, :host { --chakra-vh: 100dvh; }\n}"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "body { font-family: var(--chakra-fonts-body); color: var(--chakra-colors-chakra-body-text); background: var(--chakra-colors-chakra-body-bg); transition-property: background-color; transition-duration: var(--chakra-transition-duration-normal); line-height: var(--chakra-lineHeights-base); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "::-webkit-input-placeholder { color: var(--chakra-colors-chakra-placeholder-color); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": []
  },
  {
      "href": null,
      "type": "text/css",
      "rules": []
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "::placeholder { color: var(--chakra-colors-chakra-placeholder-color); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          "*, ::before, ::after { border-color: var(--chakra-colors-chakra-border-color); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-h94677 { padding: var(--chakra-space-4); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-ppxol5 { width: 900px; height: 900px; background: var(--chakra-colors-white); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9 { display: inline-flex; appearance: none; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; user-select: none; position: relative; white-space: nowrap; vertical-align: middle; outline: transparent solid 2px; outline-offset: 2px; line-height: 1.2; border-radius: var(--chakra-radii-md); font-weight: var(--chakra-fontWeights-semibold); transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); height: var(--chakra-sizes-10); min-width: var(--chakra-sizes-10); font-size: var(--chakra-fontSizes-md); padding-inline-start: var(--chakra-space-4); padding-inline-end: var(--chakra-space-4); background: var(--chakra-colors-teal-500); color: var(--chakra-colors-white); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9:focus-visible, .css-betff9[data-focus-visible] { box-shadow: var(--chakra-shadows-outline); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9:disabled, .css-betff9[disabled], .css-betff9[aria-disabled=\"true\"], .css-betff9[data-disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: var(--chakra-shadows-none); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9:hover, .css-betff9[data-hover] { background: var(--chakra-colors-teal-600); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9:hover:disabled, .css-betff9[data-hover]:disabled, .css-betff9:hover[disabled], .css-betff9[data-hover][disabled], .css-betff9:hover[aria-disabled=\"true\"], .css-betff9[data-hover][aria-disabled=\"true\"], .css-betff9:hover[data-disabled], .css-betff9[data-hover][data-disabled] { background: var(--chakra-colors-teal-500); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-betff9:active, .css-betff9[data-active] { background: var(--chakra-colors-teal-700); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-hdd9l7 { position: fixed; left: 0px; top: 0px; width: 100vw; height: 100vh; background: var(--chakra-colors-blackAlpha-600); z-index: var(--chakra-zIndices-modal); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-17pwl6t { display: flex; width: 100vw; height: var(--chakra-vh); position: fixed; left: 0px; top: 0px; z-index: var(--chakra-zIndices-modal); -webkit-box-pack: center; justify-content: center; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1o3pyl4 { display: flex; flex-direction: column; position: relative; width: 100%; outline: transparent solid 2px; outline-offset: 2px; z-index: var(--chakra-zIndices-modal); max-height: 100vh; color: inherit; --drawer-bg: var(--chakra-colors-white); --drawer-box-shadow: var(--chakra-shadows-lg); background: var(--drawer-bg); box-shadow: var(--drawer-box-shadow); max-width: var(--chakra-sizes-xs); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-ui-dark .css-1o3pyl4:not([data-theme]), [data-theme=\"dark\"] .css-1o3pyl4:not([data-theme]), .css-1o3pyl4[data-theme=\"dark\"] { --drawer-bg: var(--chakra-colors-gray-700); --drawer-box-shadow: var(--chakra-shadows-dark-lg); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1ik4h6n { outline: transparent solid 2px; outline-offset: 2px; display: flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; flex-shrink: 0; width: var(--close-button-size); height: var(--close-button-size); border-radius: var(--chakra-radii-md); transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); background: var(--close-button-bg); --close-button-size: var(--chakra-sizes-8); font-size: var(--chakra-fontSizes-xs); position: absolute; top: var(--chakra-space-2); right: var(--chakra-space-3); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1ik4h6n:disabled, .css-1ik4h6n[disabled], .css-1ik4h6n[aria-disabled=\"true\"], .css-1ik4h6n[data-disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: var(--chakra-shadows-none); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1ik4h6n:hover, .css-1ik4h6n[data-hover] { --close-button-bg: var(--chakra-colors-blackAlpha-100); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-ui-dark .css-1ik4h6n:hover:not([data-theme]), .chakra-ui-dark .css-1ik4h6n[data-hover]:not([data-theme]), [data-theme=\"dark\"] .css-1ik4h6n:hover:not([data-theme]), [data-theme=\"dark\"] .css-1ik4h6n[data-hover]:not([data-theme]), .css-1ik4h6n:hover[data-theme=\"dark\"], .css-1ik4h6n[data-hover][data-theme=\"dark\"] { --close-button-bg: var(--chakra-colors-whiteAlpha-100); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1ik4h6n:active, .css-1ik4h6n[data-active] { --close-button-bg: var(--chakra-colors-blackAlpha-200); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-ui-dark .css-1ik4h6n:active:not([data-theme]), .chakra-ui-dark .css-1ik4h6n[data-active]:not([data-theme]), [data-theme=\"dark\"] .css-1ik4h6n:active:not([data-theme]), [data-theme=\"dark\"] .css-1ik4h6n[data-active]:not([data-theme]), .css-1ik4h6n:active[data-theme=\"dark\"], .css-1ik4h6n[data-active][data-theme=\"dark\"] { --close-button-bg: var(--chakra-colors-whiteAlpha-200); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1ik4h6n:focus-visible, .css-1ik4h6n[data-focus-visible] { box-shadow: var(--chakra-shadows-outline); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-onkibi { width: 1em; height: 1em; display: inline-block; line-height: 1em; flex-shrink: 0; color: currentcolor; vertical-align: middle; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-9fgtzh { flex: 0 1 0%; padding-inline-start: var(--chakra-space-6); padding-inline-end: var(--chakra-space-6); padding-top: var(--chakra-space-4); padding-bottom: var(--chakra-space-4); font-size: var(--chakra-fontSizes-xl); font-weight: var(--chakra-fontWeights-semibold); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-79z5gx { padding-inline-start: var(--chakra-space-6); padding-inline-end: var(--chakra-space-6); padding-top: var(--chakra-space-2); padding-bottom: var(--chakra-space-2); flex: 1 1 0%; overflow: auto; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv { width: 100%; height: var(--input-height); font-size: var(--input-font-size); padding-inline-start: var(--input-padding); padding-inline-end: var(--input-padding); border-radius: var(--input-border-radius); min-width: 0px; outline: transparent solid 2px; outline-offset: 2px; position: relative; appearance: none; transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); --input-font-size: var(--chakra-fontSizes-md); --input-padding: var(--chakra-space-4); --input-border-radius: var(--chakra-radii-md); --input-height: var(--chakra-sizes-10); border-width: 1px; border-style: solid; border-image: initial; border-color: inherit; background: inherit; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv:disabled, .css-1cjy4zv[disabled], .css-1cjy4zv[aria-disabled=\"true\"], .css-1cjy4zv[data-disabled] { opacity: 0.4; cursor: not-allowed; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv:hover, .css-1cjy4zv[data-hover] { border-color: var(--chakra-colors-gray-300); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv[aria-readonly=\"true\"], .css-1cjy4zv[readonly], .css-1cjy4zv[data-readonly] { user-select: all; box-shadow: var(--chakra-shadows-none) !important; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv[aria-invalid=\"true\"], .css-1cjy4zv[data-invalid] { border-color: rgb(229, 62, 62); box-shadow: rgb(229, 62, 62) 0px 0px 0px 1px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-1cjy4zv:focus-visible, .css-1cjy4zv[data-focus-visible] { z-index: 1; border-color: rgb(49, 130, 206); box-shadow: rgb(49, 130, 206) 0px 0px 0px 1px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-k0waxj { display: flex; -webkit-box-align: center; align-items: center; -webkit-box-pack: end; justify-content: flex-end; padding-inline-start: var(--chakra-space-6); padding-inline-end: var(--chakra-space-6); padding-top: var(--chakra-space-4); padding-bottom: var(--chakra-space-4); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh { display: inline-flex; appearance: none; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; user-select: none; position: relative; white-space: nowrap; vertical-align: middle; outline: transparent solid 2px; outline-offset: 2px; line-height: 1.2; border-radius: var(--chakra-radii-md); font-weight: var(--chakra-fontWeights-semibold); transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); height: var(--chakra-sizes-10); min-width: var(--chakra-sizes-10); font-size: var(--chakra-fontSizes-md); padding-inline-start: var(--chakra-space-4); padding-inline-end: var(--chakra-space-4); border-width: 1px; border-style: solid; border-image: initial; border-color: var(--chakra-colors-gray-200); color: var(--chakra-colors-gray-800); margin-right: var(--chakra-space-3); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh:focus-visible, .css-sy9hzh[data-focus-visible] { box-shadow: var(--chakra-shadows-outline); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh:disabled, .css-sy9hzh[disabled], .css-sy9hzh[aria-disabled=\"true\"], .css-sy9hzh[data-disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: var(--chakra-shadows-none); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh:hover, .css-sy9hzh[data-hover] { background: var(--chakra-colors-gray-100); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh:hover:disabled, .css-sy9hzh[data-hover]:disabled, .css-sy9hzh:hover[disabled], .css-sy9hzh[data-hover][disabled], .css-sy9hzh:hover[aria-disabled=\"true\"], .css-sy9hzh[data-hover][aria-disabled=\"true\"], .css-sy9hzh:hover[data-disabled], .css-sy9hzh[data-hover][data-disabled] { background: initial; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-button__group[data-attached][data-orientation=\"horizontal\"] > .css-sy9hzh:not(:last-of-type) { margin-inline-end: -1px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".chakra-button__group[data-attached][data-orientation=\"vertical\"] > .css-sy9hzh:not(:last-of-type) { margin-bottom: -1px; }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-sy9hzh:active, .css-sy9hzh[data-active] { background: var(--chakra-colors-gray-200); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409 { display: inline-flex; appearance: none; -webkit-box-align: center; align-items: center; -webkit-box-pack: center; justify-content: center; user-select: none; position: relative; white-space: nowrap; vertical-align: middle; outline: transparent solid 2px; outline-offset: 2px; line-height: 1.2; border-radius: var(--chakra-radii-md); font-weight: var(--chakra-fontWeights-semibold); transition-property: var(--chakra-transition-property-common); transition-duration: var(--chakra-transition-duration-normal); height: var(--chakra-sizes-10); min-width: var(--chakra-sizes-10); font-size: var(--chakra-fontSizes-md); padding-inline-start: var(--chakra-space-4); padding-inline-end: var(--chakra-space-4); background: var(--chakra-colors-blue-500); color: var(--chakra-colors-white); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409:focus-visible, .css-jut409[data-focus-visible] { box-shadow: var(--chakra-shadows-outline); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409:disabled, .css-jut409[disabled], .css-jut409[aria-disabled=\"true\"], .css-jut409[data-disabled] { opacity: 0.4; cursor: not-allowed; box-shadow: var(--chakra-shadows-none); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409:hover, .css-jut409[data-hover] { background: var(--chakra-colors-blue-600); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409:hover:disabled, .css-jut409[data-hover]:disabled, .css-jut409:hover[disabled], .css-jut409[data-hover][disabled], .css-jut409:hover[aria-disabled=\"true\"], .css-jut409[data-hover][aria-disabled=\"true\"], .css-jut409:hover[data-disabled], .css-jut409[data-hover][data-disabled] { background: var(--chakra-colors-blue-500); }"
      ]
  },
  {
      "href": null,
      "type": "text/css",
      "rules": [
          ".css-jut409:active, .css-jut409[data-active] { background: var(--chakra-colors-blue-700); }"
      ]
  }
]