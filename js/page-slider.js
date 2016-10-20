;(function (root, factory) {

    if (typeof exports === 'object') {
        module.exports = factory()
    } else {
        root.PageSlider = factory(root.jQuery)
    }

}(window, function () {

    var util = {

        qs: function(el, parent) {
            if (parent === 'string') {
                return document.querySelector(parent).querySelector(el)
            } else if (parent === 'object') {
                return parent.querySelector(el)
            } else {
                return document.querySelector(el)
            }
        },

        qsa: function(el, parent) {
            if (parent === 'string') {
                return document.querySelector(parent).querySelectorAll(el)
            } else if (parent === 'object') {
                return parent.querySelectorAll(el)
            } else {
                return document.querySelectorAll(el)
            }
        },

        getStyle: function(el, prop) {
            if (typeof el === 'string') {
                return parseFloat(window.getComputedStyle(document.querySelector(el), null).getPropertyValue(prop))
            } else if (typeof el === 'object') {
                return parseFloat(window.getComputedStyle(el, null).getPropertyValue(prop))
            }
        },

        css: function(el, style) {
            if (typeof style === 'object') {
                Object.keys(style).forEach(function(key) {
                    el.style[key] = style[key]
                })
            } else if (style === '') {
                el.style = ''
            }

        },

        style: function(rules) {
            var style = document.createElement('style')

            document.getElementsByTagName('head')[0].appendChild(style)

            if (!window.createPopup) {
               style.appendChild(document.createTextNode(''));
            }

            var s = document.styleSheets[document.styleSheets.length - 1]

            Object.keys(rules).forEach(function(selector) {

                var rule = rules[selector],
                    ruleStr = ''

                Object.keys(rule).forEach(function(prop) {
                    ruleStr += prop + ':' + rule[prop] + ';'
                })

                s.insertRule(selector + ' {' + ruleStr + '}', s.cssRules.length)
            })
        },

        extend: function(obj1, obj2) {
            var newObj = Object.create(obj1)

            if (obj2) {
                Object.keys(obj2).forEach(function(key) {
                    newObj[key] = obj2[key]
                })
            }

            return newObj
        }

    }

    var config = {
        page: '.v-page',
        speed: 400,
        duration: 600,
		easing: 'cubic-bezier(0.15, 0.45, 0.25, 1)',
        before() {},
		after() {}
    }

    function PageSlider(el, opts) {
        this.el = util.qs(el)
        this.opts = util.extend(config, opts)

        this.init()
        this.bindEvents()
    }

    PageSlider.prototype = {

        init: function() {
            var that = this

            this.viewWidth = util.getStyle(this.el, 'width')
            this.viewHeight = util.getStyle(this.el, 'height')
            this.pages = util.qsa(this.opts.page, this.el)
            this.length = this.pages.length
            this.animating = false
            this.activeIndex = 0
            this.pages[this.activeIndex].classList.add('page-slider-active')

            util.style({
                '.v-page': {
                    display: 'none',
                    position: 'absolute',
                    'z-index': '99',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    'background-size': 'cover',
                    'background-position': 'center',
                    'background-repeat': 'no-repeat'
                },
                '.page-slider-active': {
                    display: 'block',
                    'z-index': '100'
                },
                '.page-slider-next': {
                    display: 'block',
                    'z-index': '999',
                    transform: 'translate3d(0, 100%, 0)',
                    '-webkit-transform': 'translate3d(0, 100%, 0)'
                },
                '.page-slider-active.page-slider-animating': {
                    transition: 'all ' + (that.opts.speed * 1.4) + 'ms ' + that.opts.easing
                },
                '.page-slider-next.page-slider-animating': {
                    transition: 'all ' + that.opts.speed + 'ms ' + that.opts.easing
                }
            })
        },

        bindEvents: function() {
            var that = this,
                el = that.el,
                activeEl = null,
                nextEl = null,
                startX = 0,
                startY = 0,
                moveX = 0,
                moveY = 0,
                dir = 1,
                scale = 0,
                dY_1 = 0,
                dY_2 = 0,
                next = 0,
                dHeight = that.viewHeight / 0.3

            el.addEventListener('touchstart', function(e) {
                if (that.animating) return;

                var touch = e.touches[0]

                activeEl = util.qs('.page-slider-active', that.el)
                startX = touch.pageX
                startY = touch.pageY
            })

            el.addEventListener('touchmove', function(e) {
                if (that.animating) return;

                e.preventDefault()

                var touch = e.touches[0]

                moveX = touch.pageX - startX
                moveY = touch.pageY - startY
                scale = 1 - Math.abs(moveY) / dHeight
                dir = (-moveY / Math.abs(moveY))
                dY_1 = moveY * 2 / 5
                dY_2 = that.viewHeight * dir + moveY
                next = that.activeIndex + dir

                if (next > that.length - 1 || next < 0) return

                if (Math.abs(moveY) > Math.abs(moveX)) {
                    nextEl = that.pages[next]
                    nextEl.classList.add('page-slider-next')

                    util.css(activeEl, {
                        transform: 'translate3d(0, ' + dY_1 + 'px ,0) scale(' + scale + ')',
                        webkitTransform: 'translate3d(0, ' + dY_1 + 'px ,0) scale(' + scale + ')'
                    })

                    util.css(nextEl, {
                        transform: 'translate3d(0, ' + dY_2 + 'px ,0)',
                        webkitTransform: 'translate3d(0, ' + dY_2 + 'px ,0)'
                    })
                }
            })

            el.addEventListener('touchend', function() {

                if (that.animating) return;

                if (Math.abs(moveY) === 0 || next > that.length - 1 || next < 0) return;

                that.animating = true

                activeEl.classList.add('page-slider-animating')
                nextEl.classList.add('page-slider-animating')

                if (Math.abs(moveY) / that.viewHeight > 0.1) {
                    util.css(activeEl, {
                        transform: 'translate3d(0, ' + (-dir * 100) + '% ,0) scale(' + (scale - 0.1) + ')',
                        webkitTransform: 'translate3d(0, ' + (-dir * 100) + '% ,0) scale(' + (scale - 0.1) + ')'
                    })

                    util.css(nextEl, {
                        transform: 'translate3d(0, 0 ,0)',
                        webkitTransform: 'translate3d(0, 0 ,0)'
                    })

                    that.activeIndex += dir
                } else {
                    util.css(activeEl, {
                        transform: 'translate3d(0, 0 ,0) scale(1)',
                        webkitTransform: 'translate3d(0, 0 ,0) scale(1)'
                    })

                    util.css(nextEl, {
                        transform: 'translate3d(0, 100% ,0)',
                        webkitTransform: 'translate3d(0, 100% ,0)'
                    })
                }

            })

            el.addEventListener('transitionend', function() {
                that.animating = false
                activeEl.classList.remove('page-slider-animating', 'page-slider-active')
                nextEl.classList.remove('page-slider-animating', 'page-slider-next')
                util.css(activeEl, '')
                that.pages[that.activeIndex].classList.add('page-slider-active')
            })

        }

    }

    function transitionEnd() {

    }

    return PageSlider
}));
