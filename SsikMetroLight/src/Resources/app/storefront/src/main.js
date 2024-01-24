import HeaderFloatingCart               from './plugin/header/header-floating-cart.plugin';
import BuyWidgetQuantity                from './plugin/widget/buy-widget-quantity.plugin';
import EasyQuickView                    from './plugin/easy-quick-view/easy-quick-view.plugin';
import ProductImgHoverPlugin            from './plugin/product-img-hover/product-img-hover.plugin';
import MainNavigationSticky             from './plugin/navigation/main-navigation-sticky.plugin';
import UspBarSliderPlugin               from './plugin/slider/usp-bar-slider.plugin';
import LoginModal                       from './plugin/login-form/login-form.plugin';
import NavigationDropdowns              from './plugin/navigation/navigation-dropdowns.plugin';
import SsikSearchForm                   from './plugin/header/search-form.plugin';
import SsikAddCart                      from './plugin/add-cart/add-cart.plugin';
import SsikElementorPlugin              from './plugin/elementor/elementor.plugin';

const PluginManager = window.PluginManager;

PluginManager.register('MainNavigationSticky', MainNavigationSticky, '[data-header-floating]');
PluginManager.register('HeaderFloatingCart', HeaderFloatingCart, 'body');
PluginManager.register('SsikElementor', SsikElementorPlugin, 'body');
PluginManager.register('BuyWidgetQuantityPlugin', BuyWidgetQuantity, '[data-buy-widget-quantity]');
PluginManager.register('EasyQuickView', EasyQuickView, '[data-easy-quick]');
PluginManager.register('ProductImgHoverPlugin', ProductImgHoverPlugin, '[data-product-img-hover]');
PluginManager.register('UspBarSlider', UspBarSliderPlugin, '[data-usp-bar-slider]');
PluginManager.register('SsikLoginModal', LoginModal, '[data-ssik-login-modal]');
PluginManager.register('SsikNavigationDropdowns', NavigationDropdowns, '[data-ssik-main-dropdowns]');
PluginManager.register('SsikSearchForm', SsikSearchForm, '[data-ssik-search-form]');
PluginManager.register('SsikAddCart', SsikAddCart, '[data-ssik-add-cart]');

if (module.hot) {
    module.hot.accept();
}

const footerNewsletterMail = document.body.querySelector('#footerNewsletterMail');
if(footerNewsletterMail) {
    footerNewsletterMail.addEventListener('click', () => {
        const newsletterCaptcha = document.body.querySelector('#newsletter-captcha');
        if(newsletterCaptcha) {
            newsletterCaptcha.classList.add('show');
        }
    });
}

const jsFooterColumn = document.body.querySelectorAll('.js-footer-column');
if(jsFooterColumn.length > 0) {
    jsFooterColumn.forEach(item => {
        const head = item.querySelector('.footer-headline');
        if(head) head.classList.add('show');
        const content = item.querySelector('.footer-column-content');
        if(content) content.classList.add('collapse', 'show');
    });
}