import Plugin from 'src/plugin-system/plugin.class';

export default class SsikElementorPlugin extends Plugin {
    static options = {}

    init() {
        this._moveShippingCostsForm();
    }

    _moveShippingCostsForm() {
        const element       = document.body.querySelector('.cart-shipping-costs-container > form');
        const destination   = document.body.querySelector('.ssik-cart-shipping-costs-container');

        if(element && destination) {
            destination.appendChild(element);
        }
    }
}