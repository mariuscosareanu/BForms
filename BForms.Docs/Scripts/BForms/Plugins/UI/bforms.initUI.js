﻿(function (factory) {
    if (typeof define === "function" && define.amd) {
        define('bforms-initUI', ['jquery', 'jquery-migrate', 'bootstrap', 'jquery-ui-core', 'bforms-datepicker-i18n'], factory);
    } else {
        factory(window.jQuery);
    }

})(function ($) {
    $.fn.bsInitUIDefaults = {
        select2: true,
        select2Selector: '.bs-dropdown:not(.no-select2), .bs-dropdown-grouped:not(.no-select2)',

        multiSelect2: true,
        multiSelect2Selector: '.bs-listbox:not(.no-select2), .bs-listbox-grouped:not(.no-select2)',

        autocomplete: true,
        autocompleteSelector: '.bs-autocomplete',

        radioButtons: true,
        radioButtonsSelector: '.bs-radio-list',

        checkBoxList: true,
        checkBoxListSelector: '.bs-checkbox-list',

        tagList: true,
        tagListSelector: '.bs-tag-list',

        datepicker: true,
        datepickerSelector: '.bs-date',

        timepicker: true,
        timepickerSelector: '.bs-time',

        datetimepicker: true,
        datetimepickerSelector: '.bs-datetime',

        datetimerange: true,
        datetimerangeSelector: '.bs-datetime-range',

        daterange: true,
        daterangeSelector: '.bs-date-range',

        timerange: true,
        timerangeSelector: '.bs-time-range',

        loadingSelector: '.loading',
        loadingClass: 'loading'
    };

    $.fn.bsInitUI = function (opts) {
        return (new initUI($(this), $.extend(true, {}, $.fn.bsInitUIDefaults, opts))).promise;
    };

    var initUI = (function ($, undefined) {

        var InitUI = function ($elem, opts) {
            this.$elem = $elem;
            this.options = opts;

            this.deferredList = [];
            this.loadAMD = (typeof define === "function" && typeof define.amd !== "undefined");

            this.loadAllDeferred = $.Deferred();
            this.promise = this.loadAllDeferred.promise();

            this._applyStyles();

            $.when.apply(this, this.deferredList).done($.proxy(function () {
                this.loadAllDeferred.resolve();
                this._addTheme();
            }, this));
        };


        InitUI.prototype._getOptions = function (elem) {
            return $.extend(true, {}, $(elem).data('options'));
        };

        InitUI.prototype._removePlaceholder = function($elem) {
            $elem.each(function () {
                if (typeof $(this).data('val-required') !== "undefined") {
                    $elem.find('option[value=""]').remove();
                }
            });
        };

        InitUI.prototype._addTheme = function() {
            var $themeSelect = $(".bs-selectTheme");
            if ($themeSelect.length) {
                var currentColor = $themeSelect.bsThemeSelect('getCurrentColorClass');
                $('.bs-datetime-picker, .bs-range-picker').addClass(currentColor);

            }
        };

        InitUI.prototype._applyStyles = function () {

            var self = this;

            //set ui i18n
            var uiLocale = $('html').attr('lang') !== "undefined" ? $('html').attr('lang') : 'en';
            if (requireConfig &&requireConfig.locale) {
                var locale = requireConfig.locale;
                if (typeof moment.langData(locale) !== "undefined") {
                    uiLocale = locale;
                }
            }

            if (uiLocale != 'en' && typeof uiLocale !== "undefined") {
                //load external i18n files
                var localeDeferred = $.Deferred();
                this.deferredList.push(localeDeferred);
                require([
                    'validate-' + uiLocale,
                    'select2-' + uiLocale
                ], function () {
                    localeDeferred.resolve();
                });
            }

            if (this.options.select2 === true) {
                if ($.browser.mobile) {
                    this._removePlaceholder(self.$elem.find(self.options.select2Selector));
                } else {
                    if (self.loadAMD) {
                        var select2Deferred = $.Deferred();
                        this.deferredList.push(select2Deferred);

                        require(['bforms-select2'], function () {
                            self.$elem.find(self.options.select2Selector).each(function () {
                                $(this).select2(self._getOptions(this));
                            });

                            select2Deferred.resolve();
                        });
                    } else {
                        if (typeof $.fn.select2 === "function") {
                            this.$elem.find(this.options.select2Selector).each(function () {
                                $(this).select2(self._getOptions(this));
                            });
                        } else {
                            throw "bforms.select2 script must be loaded before calling initUI";
                        }
                    }
                }
            }

            if (this.options.tagList === true && this.$elem.find(this.options.tagListSelector).length) {

                if ($.browser.mobile) {
                    this._removePlaceholder(this.$elem.find(self.options.tagListSelector));

                } else {

                    if (self.loadAMD) {
                        var tagListDeferred = $.Deferred();
                        this.deferredList.push(tagListDeferred);

                        require(['bforms-select2'], function () {
                            self.$elem.find(self.options.tagListSelector).each(function () {
                                $(this).bsSelectInput(self._getOptions(this));
                            });

                            tagListDeferred.resolve();
                        });

                    } else {
                        if (typeof $.fn.bsSelectInput === "function") {
                            this.$elem.find(self.options.tagListSelector).each(function () {
                                $(this).bsSelectInput(self._getOptions(this));
                            });
                        } else {
                            throw "bforms.select2 script must be loaded before calling initUI";
                        }
                    }
                }
            }

            if (this.options.multiSelect2 === true && this.$elem.find(this.options.multiSelect2Selector).length) {
                if ($.browser.mobile) {
                    this._removePlaceholder(this.$elem.find(self.options.multiSelect2Selector));
                } else {

                    if (this.loadAMD) {

                        var multiSelectDeferred = $.Deferred();
                        this.deferredList.push(multiSelectDeferred);

                        require(['bforms-select2'], function () {
                            self.$elem.find(self.options.multiSelect2Selector).each(function () {
                                $(this).bsSelectInput($.extend(true, {}, {
                                    tags: false
                                }, self._getOptions(this)));
                            });

                            multiSelectDeferred.resolve();

                        });

                    } else {
                        if (typeof $.fn.bsSelectInput === "function") {
                            this.$elem.find(self.options.multiSelect2Selector).each(function () {
                                $(this).bsSelectInput($.extend(true, {}, {
                                    tags: false
                                }, self._getOptions(this)));
                            });
                        } else {
                            throw "bforms.select2 script must be loaded before calling initUI";
                        }
                    }
                }
            }

            if (this.options.autocomplete === true && this.$elem.find(this.options.autocompleteSelector).length) {

                if (this.loadAMD) {

                    var typeaheadDeferred = $.Deferred();
                    this.deferredList.push(typeaheadDeferred);

                    require(['bforms-typeahead'], function () {
                        self.$elem.find(self.options.autocompleteSelector).each(function () {
                            $(this).bsTypeahead(self._getOptions(this));
                        });

                        typeaheadDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsTypeahead === "function") {
                        this.$elem.find(this.options.autocompleteSelector).each(function () {
                            $(this).bsTypeahead(self._getOptions(this));
                        });
                    } else {
                        throw "bforms.typeahead script must be loaded before calling initUI";
                    }

                }
            }

            if (this.options.radioButtons === true && this.$elem.find(this.options.radioButtonsSelector).length) {

                if (this.loadAMD) {
                    var radioButtonsDeferred = $.Deferred();
                    this.deferredList.push(radioButtonsDeferred);

                    require(['bforms-radiolist'], function () {
                        self.$elem.find(self.options.radioButtonsSelector).each(function () {
                            $(this).bsRadioButtonsList(self._getOptions(this));
                        });

                        radioButtonsDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsRadioButtonsList === "function") {
                        this.$elem.find(this.options.radioButtonsSelector).each(function () {
                            $(this).bsRadioButtonsList(self._getOptions(this));
                        });
                    } else {
                        throw "radioButtonsList script must be loaded before calling initUI";
                    }

                }
            }

            if (this.options.checkBoxList === true) {
                if (this.loadAMD === true) {
                    var checkBoxListDeferred = $.Deferred();
                    this.deferredList.push(checkBoxListDeferred);

                    require(['bforms-checklist'], function () {
                        self.$elem.find(self.options.checkBoxListSelector).each(function () {
                            $(this).bsCheckBoxList(self._getOptions(this));
                        });

                        checkBoxListDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsCheckBoxList === "function") {
                        this.$elem.find(this.options.checkBoxListSelector).each(function () {
                            $(this).bsCheckBoxList(self._getOptions(this));
                        });
                    } else {
                        throw "CheckBoxList script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.datepicker === true && this.$elem.find(this.options.datepickerSelector).length) {

                if (this.loadAMD) {

                    var datepickerDeferred = $.Deferred();
                    this.deferredList.push(datepickerDeferred);

                    require(['bforms-datepicker'], function () {
                        self.$elem.find(self.options.datepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            }

                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'datepicker',
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });

                        datepickerDeferred.resolve();
                    });
                } else {
                    if (typeof $.fn.bsDatepicker === "function") {
                        this.$elem.find(self.options.datepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            };

                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'datepicker',
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bDatepicker script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.timepicker === true && this.$elem.find(this.options.timepickerSelector).length) {
                if (this.loadAMD) {

                    var timepickerDeferred = $.Deferred();
                    this.deferredList.push(timepickerDeferred);

                    require(['bforms-datepicker'], function () {
                        self.$elem.find(self.options.timepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            }

                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'timepicker',
                                is12Hours: true,
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });

                        timepickerDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsDatepicker === "function") {
                        self.$elem.find(self.options.timepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            }

                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'timepicker',
                                is12Hours: true,
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bDatepicker script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.datetimepicker === true && this.$elem.find(this.options.datetimepickerSelector).length) {

                if (this.loadAMD) {

                    var datetimepickerDeferred = $.Deferred();
                    this.deferredList.push(datetimepickerDeferred);

                    require(['bforms-datepicker'], function () {
                        self.$elem.find(self.options.datetimepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            $elem.attr('type', 'text');

                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'datetimepicker',
                                is12Hours: true,
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });

                        datetimepickerDeferred.resolve();
                    });

                } else {

                    if (typeof $.fn.bsDatepicker === "function") {
                        self.$elem.find(self.options.datetimepickerSelector).each(function (idx, elem) {
                            var $elem = $(elem);

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            }
                            var $valueField = self.$elem.find('.bs-date-iso[data-for="' + $elem.prop('name') + '"]');

                            $elem.bsDatepicker($.extend(true, {}, self._getOptions(this), {
                                type: 'datetimepicker',
                                is12Hours: true,
                                altFields: [{
                                    selector: $valueField
                                }],
                                initialValue: $valueField.val(),
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bDatepicker script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.datetimerange === true && this.$elem.find(this.options.datetimerangeSelector).length) {

                if (this.loadAMD) {
                    var datetimerangeDeferred = $.Deferred();
                    this.deferredList.push(datetimerangeDeferred);

                    require(['bforms-datepicker-range'], function () {
                        self.$elem.find(self.options.datetimerangeSelector).each(function (idx, elem) {
                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            var isMsie = typeof $.browser !== "undefined" && $.browser.msie;
                            if (!isMsie) {
                                $elem.prop('type', 'text');
                            }
                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                                $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'datetimepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1d" : "now",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'datetimepicker',
                                    initialValue: $endInput.val(),
                                    language: uiLocale,
                                },

                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });

                        datetimerangeDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsDateRange === "function") {
                        this.$elem.find(this.options.datetimerangeSelector).each(function (idx, elem) {
                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            $elem.attr('type', 'text');

                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                                $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'datetimepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1d" : "none",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'datetimepicker',
                                    initialValue: $endInput.val(),
                                    language: uiLocale
                                },

                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bRangepicker script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.daterange === true && this.$elem.find(this.options.daterangeSelector).length) {

                if (this.loadAMD) {

                    var dateRangeDeferred = $.Deferred();
                    this.deferredList.push(dateRangeDeferred);

                    require(['bforms-datepicker-range'], function () {
                        self.$elem.find(self.options.daterangeSelector).each(function (idx, elem) {

                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                               $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'datepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1d" : "now",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'datepicker',
                                    initialValue: $endInput.val(),
                                    language: uiLocale
                                },
                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });

                        dateRangeDeferred.resolve();
                    });

                } else {
                    if (typeof $.fn.bsDateRange === "function") {
                        this.$elem.find(this.options.daterangeSelector).each(function (idx, elem) {

                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                               $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'datepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1d" : "now",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'datepicker',
                                    initialValue: $endInput.val(),
                                    language: uiLocale
                                },
                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bRangepicker script must be loaded before calling initUI";
                    }
                }
            }

            if (this.options.timerange === true && this.$elem.find(this.options.timerangeSelector).length) {

                if (this.loadAMD) {

                    var timeRangeDeferred = $.Deferred();
                    this.deferredList.push(timeRangeDeferred);
                    require(['bforms-datepicker-range'], function () {
                        self.$elem.find(self.options.timerangeSelector).each(function (idx, elem) {

                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                               $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'timepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1h" : "now",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'timepicker',
                                    language: uiLocale,
                                    initialValue: $endInput.val()
                                },

                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });

                        timeRangeDeferred.resolve();
                    });

                } else {

                    if (typeof $.fn.bsDateRange === "function") {
                        this.$elem.find(this.options.timerangeSelector).each(function (idx, elem) {

                            var $elem = $(elem);
                            var rangeName = $elem.prop('name');

                            var $startInput = self.$elem.find('.bs-range-from[data-for="' + rangeName + '"]'),
                               $endInput = self.$elem.find('.bs-range-to[data-for="' + rangeName + '"]');

                            $elem.bsDateRange($.extend(true, {}, self._getOptions(this), {
                                startOptions: {
                                    type: 'timepicker',
                                    initialValue: $startInput.val(),
                                    defaultDate: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? "-1h" : "now",
                                    defaultDateValue: (typeof $endInput.val() !== "undefined" && $endInput.val() != '') ? $endInput.val() : false,
                                    language: uiLocale
                                },
                                endOptions: {
                                    type: 'timepicker',
                                    language: uiLocale,
                                    initialValue: $endInput.val()
                                },

                                startAltFields: [{ selector: $startInput }],
                                endAltFields: [{ selector: $endInput }],
                                language: uiLocale
                            }));
                        });
                    }
                    else {
                        throw "bRangepicker script must be loaded before calling initUI";
                    }
                }
            }

            //remove loading
            this.promise.done($.proxy(function () {
                var timeoutHandler = window.setTimeout($.proxy(function () {

                    if (this.$elem.hasClass(this.options.loadingClass)) {
                        this.$elem.removeClass(this.options.loadingClass);
                    } else {
                        this.$elem.find(this.options.loadingSelector).removeClass(this.options.loadingClass);
                    }

                    window.clearTimeout(timeoutHandler);
                }, this), 0);
            }, this));
        };

        return InitUI;
    })(jQuery);


    // GLYPHICON CLICK EVENT
    // ====================
    $(function () {
        $('body').on('click', '.input-group-addon', function () {
            var $next = $(this).next();

            if (!$next.is(':visible') || !$next.is('input, select'))
                $next = $next.find('input:visible, select:visible').first();

            $next.trigger('focus');
        });
    });

    return initUI;
});