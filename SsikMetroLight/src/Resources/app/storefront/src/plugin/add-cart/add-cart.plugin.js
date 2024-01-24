import Plugin from 'src/plugin-system/plugin.class';
import DomAccess from 'src/helper/dom-access.helper';

export default class SsikAddCartPlugin extends Plugin {
    static options = {
        parentContainer: '.product-box', 
        buyFormContainer: '.buy-widget',
        btnDetailContainer: '.product-action .btn-light',
    }

    init() {
        
        this.parent = this.el.closest(this.options.parentContainer);

        if(!this.parent) return;

        this._registerEvents();
    }

    _registerEvents() {

        this.buyForm = this.parent.querySelector(this.options.buyFormContainer);

        if(this.buyForm) {
            this.el.addEventListener('click', event => this._onAddCart(event));
        }
        else {
            this.btnDetail = this.parent.querySelector(this.options.btnDetailContainer);
            
            if(this.btnDetail) {
                this.el.classList.add('is-detail');
                this.el.addEventListener('click', event => {
                    document.location.href = this.btnDetail.href;
                });
            }
        }   
    }

    _onAddCart(event) {
        this.buyForm.dispatchEvent(new Event('submit'));
    }
}