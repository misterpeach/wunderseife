import Plugin from 'src/plugin-system/plugin.class';
import DomAccess from 'src/helper/dom-access.helper';


export default class SsikSearchFormPlugin extends Plugin {
    static options = {
        classOpen: 'is-search-open',
        classClose: 'close-btn',
        searchFormContainer: '.header-search-col',
    }

    init() {

        this._form = DomAccess.querySelector(document.body, this.options.searchFormContainer);
        if(!this._form) return;

        this._btnClose = this._createButtonClose();
        this._form.prepend(this._btnClose);

        this._registerEvents();
    }

    _registerEvents() {
        this.el.addEventListener('click', event => this._onShowFormSearch(event));
        this._btnClose.addEventListener('click', event => this._onCloseFormSearch(event));
    }

    _onShowFormSearch() {
        document.body.classList.add(this.options.classOpen);
    }

    _onCloseFormSearch() {
        setTimeout(() => {
            this._form.style.opacity = 0;
        }, 100);
        setTimeout(() => {
            document.body.classList.remove(this.options.classOpen);
        }, 500);

        setTimeout(() => {
            this._form.style = '';
        }, 900);
    }

    _createButtonClose() {
        const button = document.createElement('div');
        button.classList.add(this.options.classClose);
        return button;
    }
}