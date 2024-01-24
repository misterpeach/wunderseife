import Plugin from 'src/plugin-system/plugin.class';
import Iterator from 'src/helper/iterator.helper';
import DomAccess from 'src/helper/dom-access.helper';

export default class SsikNavigationDropdowns extends Plugin {

    static options = {
        menuSelector : '.main-navigation',
        dropdowns: 'data-ssik-dropdown-menu-id',
        triggerDataAttribute: 'data-flyout-menu-trigger'
    };

    init() { 
    
        this._dropdowns = this.el.querySelectorAll(`[${this.options.dropdowns}]`);
        
        if(this._dropdowns.length == 0) return;

        this._registerEvents();
    };

    _registerEvents() {
        Iterator.iterate(this._dropdowns, el => {
            const id = DomAccess.getDataAttribute(el, this.options.dropdowns);
            const menuItem = document.body.querySelector(`[${this.options.triggerDataAttribute}="${id}"]`);
            if(menuItem) {
                menuItem.classList.add('is-dropdown');
                menuItem.append(el);
            }
        });
    }
}