import Plugin from 'src/plugin-system/plugin.class';
import Iterator from 'src/helper/iterator.helper';
import FormSerializeUtil from 'src/utility/form/form-serialize.util';
import DomAccess from 'src/helper/dom-access.helper';
import HttpClient from 'src/service/http-client.service';

export default class SsikLoginModalPlugin extends Plugin {

    static options = {
        opener: '.product-box',
        closer: '.login-modal-close',
        login: 'ssikUsername',
        password: 'ssikPassword',
        submitSelector: '.login-modal-form-submit',
        errorOutputSelector: '.login-modal-errors',
        openClass: 'is-opened',
        progressClass: 'is-progress',
        errorClass: 'is-error',
        successClass: 'is-success',
        storefrontUrl: null,
    };

    init() {
    
        this._forms = DomAccess.querySelectorAll(this.el, 'form');
    
        if (this._forms.length < 1) {
            throw new Error(`No form found for the plugin: ${this.constructor.name}`);
        }

        this._opener = DomAccess.querySelector(document.body, this.options.opener);
        this._closer = DomAccess.querySelector(this.el, this.options.closer);

        if(!this._opener || !this._closer) {
            return;
        }

        this._client = new HttpClient();
        this._registerEvents();
    }

    _registerEvents() { 
        const submits = DomAccess.querySelectorAll(this.el, this.options.submitSelector);
        Iterator.iterate(submits, submit => {
            submit.addEventListener('click', event => this._onSubmitForm(event));
        });

        const toggles = DomAccess.querySelectorAll(this.el, '.is-toggle');
        Iterator.iterate(toggles, toggle => {
            toggle.addEventListener('click', event => {this._onToggleForm(event)});
        });

        this._opener.addEventListener('click', event => {this._onOpenModal(event)});
        this._closer.addEventListener('click', event => {this._onOpenModal(event)});
        
    }

    _onOpenModal(event) {
        event.preventDefault();

        if(this.el.classList.contains(this.options.openClass)) {

            this.el.classList.remove(this.options.openClass);
            this.el.classList.remove(this.options.errorClass);
            this.el.classList.remove(this.options.successClass);

            Iterator.iterate(this._forms, (form, key) => {
                if(key == 0) {
                    form.classList.remove('is-hide');
                } else {
                    form.classList.add('is-hide');
                }
            });
        }

        else {
            this.el.classList.add(this.options.openClass);
        }
    }

    _onSubmitForm(event) {
        event.preventDefault();

        const form = event.currentTarget.closest('form');

        if (form.checkValidity() === false) {
            return;
        }

        this.el.classList.remove(this.options.errorClass);
        this.el.classList.add(this.options.progressClass);

        const sendData = new FormData();
        const formData = FormSerializeUtil.serialize(form);

        if(DomAccess.getAttribute(form, 'name') == 'login') {
            sendData.append('username', formData.get(this.options.login));
            sendData.append('password', formData.get(this.options.password));
            this._client.post('/ssik/login', sendData, this._handleData.bind(this, form));
        }

        if(DomAccess.getAttribute(form, 'name') == 'restore') {
            sendData.append('email[email]', formData.get('ssikRestoreUsername'));
            this._client.post('/ssik/recovery', sendData, this._handleData.bind(this, form));
        }
    }

    _handleData(form, response) {
    
        const data = JSON.parse(response);

        this.el.classList.remove(this.options.progressClass);

        if(DomAccess.getAttribute(form, 'name') == 'login') {
            if(data.errors) {
                this.el.classList.add(this.options.errorClass);
            }
            else {
                this.el.classList.add(this.options.successClass);
                setTimeout(() => {
                    if(this.options.storefrontUrl) {
                        document.location.href = `${this.options.storefrontUrl}/account`;
                    } else {
                        document.location.reload();
                    }
                }, 100);
            }
        }

        if(DomAccess.getAttribute(form, 'name') == 'restore') {
            this.el.classList.add(this.options.successClass);
        }
    }

    _onToggleForm(event) {
        event.preventDefault();

        this.el.classList.remove(this.options.errorClass);
        this.el.classList.remove(this.options.successClass);

        Iterator.iterate(this._forms, form => {
            form.classList.toggle('is-hide');
        });
    }
 
}
