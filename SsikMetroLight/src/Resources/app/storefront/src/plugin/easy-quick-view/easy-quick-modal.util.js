
import HttpClient from 'src/service/http-client.service';
import ElementLoadingIndicatorUtil from 'src/utility/loading-indicator/element-loading-indicator.util';
import DomAccess from 'src/helper/dom-access.helper';

import Feature from 'src/helper/feature.helper';
import { REMOVE_BACKDROP_DELAY } from 'src/utility/backdrop/backdrop.util';

const PSEUDO_MODAL_CLASS = 'js-pseudo-modal';
const PSEUDO_MODAL_TEMPLATE_CLASS = 'js-pseudo-modal-template';
const PSEUDO_MODAL_TEMPLATE_CONTENT_CLASS = 'js-pseudo-modal-template-content-element';
const PSEUDO_MODAL_TEMPLATE_TITLE_CLASS = 'js-pseudo-modal-template-title-element';

export default class EasyQuickModalUtil {
    constructor(
            url, 
            callback = null, 
            useBackdrop = true, 
            templateSelector = `.${PSEUDO_MODAL_TEMPLATE_CLASS}`,
            templateContentSelector = `.${PSEUDO_MODAL_TEMPLATE_CONTENT_CLASS}`,
            templateTitleSelector = `.${PSEUDO_MODAL_TEMPLATE_TITLE_CLASS}`
        ) {
        
        this._url = url;
        this._callback = callback;
        this._useBackdrop = useBackdrop;
        this._templateSelector = templateSelector;
        this._templateContentSelector = templateContentSelector;
        this._templateTitleSelector = templateTitleSelector;
        this._client = new HttpClient();
        this._style = {
            class: 'easy-quickview',
            position: 'modal-dialog-centered'
        }
    }


    /**
     * This method can be used to update a modal's content.
     * A callback may be provided, for example to re-initialise all plugins once
     * the markup is changed.
     *
     * @param {string} content
     * @param {function} callback
     */
    updateContent(modal, url, callback) {

        const client = new HttpClient();
        const modalContent = DomAccess.querySelector(modal, '.modal-body');

        modalContent.innerHTML = '';
        ElementLoadingIndicatorUtil.create(modalContent);

        const cb = (response) => {

            ElementLoadingIndicatorUtil.remove(modalContent);
            modalContent.innerHTML = response   
            if (typeof callback === 'function') {
                callback();
            }
        };

        client.get(url, EasyQuickModalUtil.executeCallback.bind(this, cb));   
    }

    /**
     * opens the modal
     *
     * @param {function} cb
     */
     open(cb) {
        this._create();
        setTimeout(this._open.bind(this, cb), REMOVE_BACKDROP_DELAY);
    }

   
    /**
     * insert a temporarily needed wrapper div
     * with the response's html content
     *
     * @returns {HTMLElement}
     *
     * @private
     */
    _create() {
        this._modalMarkupEl = DomAccess.querySelector(document, this._templateSelector);
        this._createModalWrapper();
        
        
        this._modalWrapper.classList.add(this._style.class);
        

        ElementLoadingIndicatorUtil.create(this._modalWrapper);

        this._modal = this._createModalMarkup();

        
        const dialog = DomAccess.querySelector(this._modal, '.modal-dialog');
        dialog.classList.add(this._style.position);
        

        this._$modal = $(this._modal);

        document.body.insertAdjacentElement('beforeend', this._modalWrapper);
    }

    /**
     * closes the modal
     */
    close() {
        const modal = this.getModal();

        /** @deprecated tag:v6.5.0 - Bootstrap v5 uses native HTML elements and events to handle Modal plugin */
        if (Feature.isActive('v6.5.0.0')) {
            this._modalInstance = bootstrap.Modal.getInstance(modal);
        } else {
            $(modal).modal('hide');
        }
    }

    /**
     * returns the modal element
     *
     * @returns {HTMLElement}
     */
     getModal() {
        if (!this._modal) this._create();

        return this._modal;
    }

    /**
     * updates the modal position
     */
     updatePosition() {
        /** @deprecated tag:v6.5.0 - Bootstrap v5 uses native HTML elements and events to handle Modal plugin */
        if (Feature.isActive('v6.5.0.0')) {
            this._modalInstance.handleUpdate();
        } else {
            this._$modal.modal('handleUpdate');
        }
    }

    /**
     * @param {function} cb
     * @private
     */
     _open(cb) {
        this.getModal();

        /** @deprecated tag:v6.5.0 - Bootstrap v5 uses native HTML elements and events to handle Modal plugin */
        if (Feature.isActive('v6.5.0.0')) {
            this._modal.addEventListener('hidden.bs.modal', this._modalWrapper.remove);
            this._modal.addEventListener('shown.bs.modal', cb);

            this._modalInstance.show();
        } else {
            this._$modal.on('hidden.bs.modal', this._modalWrapper.remove);
            this._$modal.on('shown.bs.modal', cb);
            this._$modal.modal({ backdrop: this._useBackdrop });
            this._$modal.modal('show');
        }
    }


    /**
     * creates the modal wrapper
     *
     * @private
     */
     _createModalWrapper() {
        this._modalWrapper = DomAccess.querySelector(document, `.${PSEUDO_MODAL_CLASS}`, false);

        if (!this._modalWrapper) {
            this._modalWrapper = document.createElement('div');
            this._modalWrapper.classList.add(PSEUDO_MODAL_CLASS);
        }
    }

    /**
     * creates the modal markup if
     * it's not existing already
     *
     * @returns {HTMLElement}
     *
     * @private
     */
    _createModalMarkup() {
        const modal = DomAccess.querySelector(this._modalWrapper, '.modal', false);

        if (modal) {
           
            return modal;
        }

        const content = this._modalWrapper.innerHTML;
        this._modalWrapper.innerHTML = this._modalMarkupEl.innerHTML;

        this._setModalContent(content);

        const cb = (response) => {

            ElementLoadingIndicatorUtil.remove(this._modalWrapper);
            this._setModalContent(response);    

            // if a callback function is being injected execute it after opening the Modal
            if (typeof this._callback === 'function') {
                this._callback();
            }

            setTimeout(this._open.bind(this), this._delay);
        };

        this._client.get(this._url, EasyQuickModalUtil.executeCallback.bind(this,cb));   

       
        return DomAccess.querySelector(this._modalWrapper, '.modal');
    }

    /**
     * This method is used to set the modal element's title.
     *
     * @param {string} title
     * @private
     */
     _setModalTitle(title = '') {
        try {
            const titleElement = DomAccess.querySelector(this._modalWrapper, this._templateTitleSelector);
            titleElement.innerHTML = title;
        } catch (err) {
            // do nothing
        }
    }

    /**
     * This method is used to set the modal element's content.
     *
     * @private
     */
     _setModalContent(content) {
        const contentElement = DomAccess.querySelector(this._modalWrapper, this._templateContentSelector);
        contentElement.innerHTML = content;

        try {
            const titleElement = DomAccess.querySelector(contentElement, this._templateTitleSelector);
            if (titleElement) {
                this._setModalTitle(titleElement.innerHTML);
                titleElement.parentNode.removeChild(titleElement)
            }
        } catch (err) {
            // do nothing
        }
    }

    /**
     * Executes the given callback
     * and initializes all plugins
     *
     * @param {function} cb
     * @param {string} response
     */
     static executeCallback(cb, response) {
        if (typeof cb === 'function') {
            cb(response);
        }
        // window.PluginManager.initializePlugins();
    }
}
