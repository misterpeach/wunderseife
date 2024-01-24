import Plugin from 'src/plugin-system/plugin.class';
import { tns } from 'tiny-slider/src/tiny-slider.module';
import ViewportDetection from 'src/helper/viewport-detection.helper';
import SliderSettingsHelper from 'src/plugin/slider/helper/slider-settings.helper';

export default class UspBarSliderPlugin extends Plugin {
    static options = {
        initializedCls: 'js-slider-initialized',
        containerSelector: '[data-usp-bar-slider-container=true]',
        controlsSelector: '[data-usp-bar-slider-controls=true]',
        slider: {
            enabled: true,
            responsive: {
                xs: {},
                sm: {},
                md: {},
                lg: {},
                xl: {},
                xxl: {},
            },
        },
    };


    init() {
        this._slider = false;

        if (!this.el.classList.contains(this.options.initializedCls)) {
            this.options.slider = SliderSettingsHelper.prepareBreakpointPxValues(this.options.slider);

            this._getSettings(ViewportDetection.getCurrentViewport());

            this._initSlider();
            this._registerEvents();
        }
    }

    destroy() {
        if (this._slider && typeof this._slider.destroy === 'function') {
            try {
                this._slider.destroy();
            } catch (e) {}
        }
        this.el.classList.remove(this.options.initializedCls);
    }

    rebuild(viewport = ViewportDetection.getCurrentViewport(), resetIndex = false) {
        this._getSettings(viewport.toLowerCase());

        // get the current index and use it as the start index
        try {
            this.destroy();
            this._initSlider();
        } catch (e) {}

        this.$emitter.publish('rebuildUspBarSlider');
    }

    _registerEvents() {
        if (this._slider) {
            document.addEventListener('Viewport/hasChanged', () => this.rebuild(ViewportDetection.getCurrentViewport()));
        }
    }

    _getSettings(viewport) {
        this._sliderSettings = SliderSettingsHelper.getViewportSettings(this.options.slider, viewport);
    }
    
    _initSlider() {
        this.el.classList.add(this.options.initializedCls);

        const container = this.el.querySelector(this.options.containerSelector);
        const controlsContainer = this.el.querySelector(this.options.controlsSelector);
        const onInit = () => {
            PluginManager.initializePlugins();
            this.$emitter.publish('initUpsBarSlider');
        };

        if (container) {
            if (this._sliderSettings.enabled) {
                container.style.display = '';
                this._slider = tns({
                    container,
                    controlsContainer,
                    onInit,
                    ...this._sliderSettings,
                });
            }
        }

        this.$emitter.publish('afterInitUpsBarSlider');
    }
}