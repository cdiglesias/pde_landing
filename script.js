      (function () {
        var on = addEventListener,
          off = removeEventListener,
          $ = function (q) {
            return document.querySelector(q);
          },
          $$ = function (q) {
            return document.querySelectorAll(q);
          },
          $body = document.body,
          $inner = $('.inner'),
          client = (function () {
            var o = {
                browser: 'other',
                browserVersion: 0,
                os: 'other',
                osVersion: 0,
                mobile: false,
                canUse: null,
                flags: { lsdUnits: false },
              },
              ua = navigator.userAgent,
              a,
              i;
            a = [
              ['firefox', /Firefox\/([0-9\.]+)/, null],
              ['edge', /Edge\/([0-9\.]+)/, null],
              ['safari', /Version\/([0-9\.]+).+Safari/, null],
              ['chrome', /Chrome\/([0-9\.]+)/, null],
              ['chrome', /CriOS\/([0-9\.]+)/, null],
              ['ie', /Trident\/.+rv:([0-9]+)/, null],
              [
                'safari',
                /iPhone OS ([0-9_]+)/,
                function (v) {
                  return v.replace('_', '.').replace('_', '');
                },
              ],
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(a[i][2] ? a[i][2](RegExp.$1) : RegExp.$1);
                break;
              }
            }
            a = [
              [
                'ios',
                /([0-9_]+) like Mac OS X/,
                function (v) {
                  return v.replace('_', '.').replace('_', '');
                },
              ],
              [
                'ios',
                /CPU like Mac OS X/,
                function (v) {
                  return 0;
                },
              ],
              [
                'ios',
                /iPad; CPU/,
                function (v) {
                  return 0;
                },
              ],
              ['android', /Android ([0-9\.]+)/, null],
              [
                'mac',
                /Macintosh.+Mac OS X ([0-9_]+)/,
                function (v) {
                  return v.replace('_', '.').replace('_', '');
                },
              ],
              ['windows', /Windows NT ([0-9\.]+)/, null],
              ['undefined', /Undefined/, null],
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(a[i][2] ? a[i][2](RegExp.$1) : RegExp.$1);
                break;
              }
            }
            if (
              o.os == 'mac' &&
              'ontouchstart' in window &&
              ((screen.width == 1024 && screen.height == 1366) ||
                (screen.width == 834 && screen.height == 1112) ||
                (screen.width == 810 && screen.height == 1080) ||
                (screen.width == 768 && screen.height == 1024))
            )
              o.os = 'ios';
            o.mobile = o.os == 'android' || o.os == 'ios';
            var _canUse = document.createElement('div');
            o.canUse = function (property, value) {
              var style;
              style = _canUse.style;
              if (!(property in style)) return false;
              if (typeof value !== 'undefined') {
                style[property] = value;
                if (style[property] == '') return false;
              }
              return true;
            };
            o.flags.lsdUnits = o.canUse('width', '100dvw');
            return o;
          })(),
          ready = {
            list: [],
            add: function (f) {
              this.list.push(f);
            },
            run: function () {
              this.list.forEach((f) => {
                f();
              });
            },
          },
          trigger = function (t) {
            dispatchEvent(new Event(t));
          },
          cssRules = function (selectorText) {
            var ss = document.styleSheets,
              a = [],
              f = function (s) {
                var r = s.cssRules,
                  i;
                for (i = 0; i < r.length; i++) {
                  if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches) f(r[i]);
                  else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText) a.push(r[i]);
                }
              },
              x,
              i;
            for (i = 0; i < ss.length; i++) f(ss[i]);
            return a;
          },
          escapeHtml = function (s) {
            if (s === '' || s === null || s === undefined) return '';
            var a = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            s = s.replace(/[&<>"']/g, function (x) {
              return a[x];
            });
            return s;
          },
          thisHash = function () {
            var h = location.hash ? location.hash.substring(1) : null,
              a;
            if (!h) return null;
            if (h.match(/\?/)) {
              a = h.split('?');
              h = a[0];
              history.replaceState(undefined, undefined, '#' + h);
              window.location.search = a[1];
            }
            if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = 'x' + h;
            if (typeof h == 'string') h = h.toLowerCase();
            return h;
          },
          scrollToElement = function (e, style, duration) {
            var y, cy, dy, start, easing, offset, f;
            if (!e) y = 0;
            else {
              offset =
                (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) *
                parseFloat(getComputedStyle(document.documentElement).fontSize);
              switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {
                case 'default':
                default:
                  y = e.offsetTop + offset;
                  break;
                case 'center':
                  if (e.offsetHeight < window.innerHeight)
                    y = e.offsetTop - (window.innerHeight - e.offsetHeight) / 2 + offset;
                  else y = e.offsetTop - offset;
                  break;
                case 'previous':
                  if (e.previousElementSibling)
                    y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
                  else y = e.offsetTop + offset;
                  break;
              }
            }
            if (!style) style = 'smooth';
            if (!duration) duration = 750;
            if (style == 'instant') {
              window.scrollTo(0, y);
              return;
            }
            start = Date.now();
            cy = window.scrollY;
            dy = y - cy;
            switch (style) {
              case 'linear':
                easing = function (t) {
                  return t;
                };
                break;
              case 'smooth':
                easing = function (t) {
                  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                };
                break;
            }
            f = function () {
              var t = Date.now() - start;
              if (t >= duration) window.scroll(0, y);
              else {
                window.scroll(0, cy + dy * easing(t / duration));
                requestAnimationFrame(f);
              }
            };
            f();
          },
          scrollToTop = function () {
            scrollToElement(null);
          },
          loadElements = function (parent) {
            var a, e, x, i;
            $body.dispatchEvent(new CustomEvent('startComponents', { detail: { parent: parent } }));
            a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
            for (i = 0; i < a.length; i++) {
              a[i].contentWindow.location.replace(a[i].dataset.src);
              a[i].dataset.initialSrc = a[i].dataset.src;
              a[i].dataset.src = '';
            }
            a = parent.querySelectorAll('video[autoplay]');
            for (i = 0; i < a.length; i++) {
              if (a[i].paused) a[i].play();
            }
            e = parent.querySelector('[data-autofocus="1"]');
            x = e ? e.tagName : null;
            switch (x) {
              case 'FORM':
                e = e.querySelector('.field input, .field select, .field textarea');
                if (e) e.focus();
                break;
              default:
                break;
            }
            a = parent.querySelectorAll('unloaded-script');
            for (i = 0; i < a.length; i++) {
              x = document.createElement('script');
              x.setAttribute('data-loaded', '');
              if (a[i].getAttribute('src')) x.setAttribute('src', a[i].getAttribute('src'));
              if (a[i].textContent) x.textContent = a[i].textContent;
              a[i].replaceWith(x);
            }
            x = new Event('loadelements');
            a = parent.querySelectorAll('[data-unloaded]');
            a.forEach((element) => {
              element.removeAttribute('data-unloaded');
              element.dispatchEvent(x);
            });
          },
          unloadElements = function (parent) {
            var a, e, x, i;
            $body.dispatchEvent(new CustomEvent('stopComponents', { detail: { parent: parent } }));
            a = parent.querySelectorAll('iframe[data-src=""]');
            for (i = 0; i < a.length; i++) {
              if (a[i].dataset.srcUnload === '0') continue;
              if ('initialSrc' in a[i].dataset) a[i].dataset.src = a[i].dataset.initialSrc;
              else a[i].dataset.src = a[i].src;
              a[i].contentWindow.location.replace('about:blank');
            }
            a = parent.querySelectorAll('video');
            for (i = 0; i < a.length; i++) {
              if (!a[i].paused) a[i].pause();
            }
            e = $(':focus');
            if (e) e.blur();
          };
        window._scrollToTop = scrollToTop;
        var thisUrl = function () {
          return window.location.href.replace(window.location.search, '').replace(/#$/, '');
        };
        var getVar = function (name) {
          var a = window.location.search.substring(1).split('&'),
            b,
            k;
          for (k in a) {
            b = a[k].split('=');
            if (b[0] == name) return b[1];
          }
          return null;
        };
        var errors = {
          handle: function (handler) {
            window.onerror = function (message, url, line, column, error) {
              handler(error.message);
              return true;
            };
          },
          unhandle: function () {
            window.onerror = null;
          },
        };
        var loaderTimeout = setTimeout(function () {
          $body.classList.add('with-loader');
        }, 500);
        var $loaderElement = document.createElement('div');
        $loaderElement.id = 'loader';
        $body.appendChild($loaderElement);
        var loadHandler = function () {
          setTimeout(function () {
            clearTimeout(loaderTimeout);
            $body.classList.remove('is-loading');
            $body.classList.add('is-playing');
            setTimeout(function () {
              $body.classList.remove('with-loader');
              $body.classList.remove('is-playing');
              $body.classList.add('is-ready');
              setTimeout(function () {
                $body.removeChild($loaderElement);
              }, 1000);
            }, 170625);
          }, 100);
        };
        on('load', loadHandler);
        (function () {
          var initialSection,
            initialScrollPoint,
            initialId,
            header,
            footer,
            name,
            hideHeader,
            hideFooter,
            disableAutoScroll,
            h,
            e,
            ee,
            k,
            locked = false,
            title = document.title,
            scrollPointParent = function (target) {
              while (target) {
                if (target.parentElement && target.parentElement.tagName == 'SECTION') break;
                target = target.parentElement;
              }
              return target;
            },
            scrollPointSpeed = function (scrollPoint) {
              let x = parseInt(scrollPoint.dataset.scrollSpeed);
              switch (x) {
                case 5:
                  return 250;
                case 4:
                  return 500;
                case 3:
                  return 750;
                case 2:
                  return 1000;
                case 1:
                  return 1250;
                default:
                  break;
              }
              return 750;
            },
            doNextScrollPoint = function (event) {
              var e, target, id;
              e = scrollPointParent(event.target);
              if (!e) return;
              while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                  target = e;
                  id = e.dataset.scrollId;
                  break;
                }
              }
              if (!target || !id) return;
              if (target.dataset.scrollInvisible == '1') scrollToElement(target, 'smooth', scrollPointSpeed(target));
              else location.href = '#' + id;
            },
            doPreviousScrollPoint = function (e) {
              var e, target, id;
              e = scrollPointParent(event.target);
              if (!e) return;
              while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                  target = e;
                  id = e.dataset.scrollId;
                  break;
                }
              }
              if (!target || !id) return;
              if (target.dataset.scrollInvisible == '1') scrollToElement(target, 'smooth', scrollPointSpeed(target));
              else location.href = '#' + id;
            },
            doFirstScrollPoint = function (e) {
              var e, target, id;
              e = scrollPointParent(event.target);
              if (!e) return;
              while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                  target = e;
                  id = e.dataset.scrollId;
                }
              }
              if (!target || !id) return;
              if (target.dataset.scrollInvisible == '1') scrollToElement(target, 'smooth', scrollPointSpeed(target));
              else location.href = '#' + id;
            },
            doLastScrollPoint = function (e) {
              var e, target, id;
              e = scrollPointParent(event.target);
              if (!e) return;
              while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                  target = e;
                  id = e.dataset.scrollId;
                }
              }
              if (!target || !id) return;
              if (target.dataset.scrollInvisible == '1') scrollToElement(target, 'smooth', scrollPointSpeed(target));
              else location.href = '#' + id;
            },
            doNextSection = function () {
              var section;
              section = $('.site-main > .inner > section.active').nextElementSibling;
              if (!section || section.tagName != 'SECTION') return;
              location.href = '#' + section.id.replace(/-section$/, '');
            },
            doPreviousSection = function () {
              var section;
              section = $('.site-main > .inner > section.active').previousElementSibling;
              if (!section || section.tagName != 'SECTION') return;
              location.href = '#' + (section.matches(':first-child') ? '' : section.id.replace(/-section$/, ''));
            },
            doFirstSection = function () {
              var section;
              section = $('.site-main > .inner > section:first-of-type');
              if (!section || section.tagName != 'SECTION') return;
              location.href = '#' + section.id.replace(/-section$/, '');
            },
            doLastSection = function () {
              var section;
              section = $('.site-main > .inner > section:last-of-type');
              if (!section || section.tagName != 'SECTION') return;
              location.href = '#' + section.id.replace(/-section$/, '');
            },
            resetSectionChangeElements = function (section) {
              var ee, e, x;
              ee = section.querySelectorAll('[data-reset-on-section-change="1"]');
              for (e of ee) {
                x = e ? e.tagName : null;
                switch (x) {
                  case 'FORM':
                    e.reset();
                    break;
                  default:
                    break;
                }
              }
            },
            activateSection = function (section, scrollPoint) {
              var sectionHeight,
                currentSection,
                currentSectionHeight,
                name,
                hideHeader,
                hideFooter,
                disableAutoScroll,
                ee,
                k;
              if (!section.classList.contains('inactive')) {
                name = section ? section.id.replace(/-section$/, '') : null;
                disableAutoScroll = name
                  ? name in sections && 'disableAutoScroll' in sections[name] && sections[name].disableAutoScroll
                  : false;
                if (scrollPoint) scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
                else if (!disableAutoScroll) scrollToElement(null);
                return false;
              } else {
                locked = true;
                if (location.hash == '#home') history.replaceState(null, null, '#');
                name = section ? section.id.replace(/-section$/, '') : null;
                disableAutoScroll = name
                  ? name in sections && 'disableAutoScroll' in sections[name] && sections[name].disableAutoScroll
                  : false;
                currentSection = $('section:not(.inactive)');
                if (currentSection) {
                  currentSection.classList.add('inactive');
                  document.title = title;
                  unloadElements(currentSection);
                  resetSectionChangeElements(currentSection);
                  clearTimeout(window._sectionTimeoutId);
                  setTimeout(function () {
                    currentSection.style.display = 'none';
                    currentSection.classList.remove('active');
                  }, 250);
                }
                if (section.dataset.title) document.title = section.dataset.title + ' - ' + title;
                setTimeout(function () {
                  section.style.display = '';
                  trigger('resize');
                  if (!disableAutoScroll) scrollToElement(null, 'instant');
                  setTimeout(function () {
                    section.classList.remove('inactive');
                    section.classList.add('active');
                    setTimeout(function () {
                      loadElements(section);
                      if (scrollPoint) scrollToElement(scrollPoint, 'instant');
                      locked = false;
                    }, 500);
                  }, 75);
                }, 250);
              }
            },
            sections = {};
          window._nextScrollPoint = doNextScrollPoint;
          window._previousScrollPoint = doPreviousScrollPoint;
          window._firstScrollPoint = doFirstScrollPoint;
          window._lastScrollPoint = doLastScrollPoint;
          window._nextSection = doNextSection;
          window._previousSection = doPreviousSection;
          window._firstSection = doFirstSection;
          window._lastSection = doLastSection;
          window._scrollToTop = function () {
            var section, id;
            scrollToElement(null);
            if (!!(section = $('section.active'))) {
              id = section.id.replace(/-section$/, '');
              if (id == 'home') id = '';
              history.pushState(null, null, '#' + id);
            }
          };
          if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
          header = $('#header');
          footer = $('#footer');
          h = thisHash();
          if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) h = null;
          if ((e = $('[data-scroll-id="' + h + '"]'))) {
            initialScrollPoint = e;
            initialSection = initialScrollPoint.parentElement;
            initialId = initialSection.id;
          } else if ((e = $('#' + (h ? h : 'home') + '-section'))) {
            initialScrollPoint = null;
            initialSection = e;
            initialId = initialSection.id;
          }
          if (!initialSection) {
            initialScrollPoint = null;
            initialSection = $('#' + 'home' + '-section');
            initialId = initialSection.id;
            history.replaceState(undefined, undefined, '#');
          }
          name = h ? h : 'home';
          hideHeader = name ? name in sections && 'hideHeader' in sections[name] && sections[name].hideHeader : false;
          hideFooter = name ? name in sections && 'hideFooter' in sections[name] && sections[name].hideFooter : false;
          disableAutoScroll = name
            ? name in sections && 'disableAutoScroll' in sections[name] && sections[name].disableAutoScroll
            : false;
          if (header && hideHeader) {
            header.classList.add('hidden');
            header.style.display = 'none';
          }
          if (footer && hideFooter) {
            footer.classList.add('hidden');
            footer.style.display = 'none';
          }
          ee = $$('.site-main > .inner > section:not([id="' + initialId + '"])');
          for (k = 0; k < ee.length; k++) {
            ee[k].className = 'inactive';
            ee[k].style.display = 'none';
          }
          initialSection.classList.add('active');
          ready.add(() => {
            if (initialSection.dataset.title) document.title = initialSection.dataset.title + ' - ' + title;
            loadElements(initialSection);
            if (header) loadElements(header);
            if (footer) loadElements(footer);
            if (!disableAutoScroll) scrollToElement(null, 'instant');
          });
          on('load', function () {
            if (initialScrollPoint) scrollToElement(initialScrollPoint, 'instant');
          });
          on('hashchange', function (event) {
            var section, scrollPoint, h, e;
            if (locked) return false;
            h = thisHash();
            if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) return false;
            if ((e = $('[data-scroll-id="' + h + '"]'))) {
              scrollPoint = e;
              section = scrollPoint.parentElement;
            } else if ((e = $('#' + (h ? h : 'home') + '-section'))) {
              scrollPoint = null;
              section = e;
            } else {
              scrollPoint = null;
              section = $('#' + 'home' + '-section');
              history.replaceState(undefined, undefined, '#');
            }
            if (!section) return false;
            activateSection(section, scrollPoint);
            return false;
          });
          on('click', function (event) {
            var t = event.target,
              tagName = t.tagName.toUpperCase(),
              scrollPoint,
              section;
            switch (tagName) {
              case 'IMG':
              case 'SVG':
              case 'USE':
              case 'U':
              case 'STRONG':
              case 'EM':
              case 'CODE':
              case 'S':
              case 'MARK':
              case 'SPAN':
                while (!!(t = t.parentElement)) if (t.tagName == 'A') break;
                if (!t) return;
                break;
              default:
                break;
            }
            if (t.tagName == 'A' && t.getAttribute('href') !== null && t.getAttribute('href').substr(0, 1) == '#') {
              if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
                event.preventDefault();
                section = scrollPoint.parentElement;
                if (section.classList.contains('inactive')) {
                  history.pushState(null, null, '#' + section.id.replace(/-section$/, ''));
                  activateSection(section, scrollPoint);
                } else {
                  scrollToElement(scrollPoint, 'smooth', scrollPointSpeed(scrollPoint));
                }
              } else if (t.hash == window.location.hash) {
                event.preventDefault();
                history.replaceState(undefined, undefined, '#');
                location.replace(t.hash);
              }
            }
          });
        })();
        var style, sheet, rule;
        style = document.createElement('style');
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);
        sheet = style.sheet;
        if (client.mobile) {
          (function () {
            if (client.flags.lsdUnits) {
              document.documentElement.style.setProperty('--viewport-height', '100svh');
              document.documentElement.style.setProperty('--background-height', '100lvh');
            } else {
              var f = function () {
                document.documentElement.style.setProperty('--viewport-height', window.innerHeight + 'px');
                document.documentElement.style.setProperty('--background-height', window.innerHeight + 250 + 'px');
              };
              on('load', f);
              on('orientationchange', function () {
                setTimeout(function () {
                  f();
                }, 100);
              });
            }
          })();
        }
        if (client.os == 'android') {
          (function () {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            var f = function () {
              rule.style.cssText = 'height: ' + Math.max(screen.width, screen.height) + 'px';
            };
            on('load', f);
            on('orientationchange', f);
            on('touchmove', f);
          })();
          $body.classList.add('touch');
        } else if (client.os == 'ios') {
          if (client.osVersion <= 11)
            (function () {
              sheet.insertRule('body::after { }', 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = '-webkit-transform: scale(1.0)';
            })();
          if (client.osVersion <= 11)
            (function () {
              sheet.insertRule('body.ios-focus-fix::before { }', 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = 'height: calc(100% + 60px)';
              on(
                'focus',
                function (event) {
                  $body.classList.add('ios-focus-fix');
                },
                true,
              );
              on(
                'blur',
                function (event) {
                  $body.classList.remove('ios-focus-fix');
                },
                true,
              );
            })();
          $body.classList.add('touch');
        }
        (function () {
          var breakpoints = { small: '(max-width: 736px)', medium: '(max-width: 980px)' },
            elements = $$('[data-reorder]');
          elements.forEach(function (e) {
            var desktop = [],
              mobile = [],
              state = false,
              query,
              a,
              x,
              ce,
              f;
            if ('reorderBreakpoint' in e.dataset && e.dataset.reorderBreakpoint in breakpoints)
              query = breakpoints[e.dataset.reorderBreakpoint];
            else query = breakpoints.small;
            for (ce of e.childNodes) {
              if (ce.nodeType != 1) continue;
              desktop.push(ce);
            }
            a = e.dataset.reorder.split(',');
            for (x of a) mobile.push(desktop[parseInt(x)]);
            f = function () {
              var order = null,
                ce;
              if (window.matchMedia(query).matches) {
                if (!state) {
                  state = true;
                  for (ce of mobile) e.appendChild(ce);
                }
              } else {
                if (state) {
                  state = false;
                  for (ce of desktop) e.appendChild(ce);
                }
              }
            };
            on('resize', f);
            on('orientationchange', f);
            on('load', f);
            on('fullscreenchange', f);
          });
        })();
        var scrollEvents = {
          items: [],
          add: function (o) {
            this.items.push({
              element: o.element,
              triggerElement: 'triggerElement' in o && o.triggerElement ? o.triggerElement : o.element,
              enter: 'enter' in o ? o.enter : null,
              leave: 'leave' in o ? o.leave : null,
              mode: 'mode' in o ? o.mode : 4,
              threshold: 'threshold' in o ? o.threshold : 0.25,
              offset: 'offset' in o ? o.offset : 0,
              initialState: 'initialState' in o ? o.initialState : null,
              state: false,
            });
          },
          handler: function () {
            var height, top, bottom, scrollPad;
            if (client.os == 'ios') {
              height = document.documentElement.clientHeight;
              top = document.body.scrollTop + window.scrollY;
              bottom = top + height;
              scrollPad = 125;
            } else {
              height = document.documentElement.clientHeight;
              top = document.documentElement.scrollTop;
              bottom = top + height;
              scrollPad = 0;
            }
            scrollEvents.items.forEach(function (item) {
              var elementTop, elementBottom, viewportTop, viewportBottom, bcr, pad, state, a, b;
              if (!item.enter && !item.leave) return true;
              if (!item.triggerElement) return true;
              if (item.triggerElement.offsetParent === null) {
                if (item.state == true && item.leave) {
                  item.state = false;
                  item.leave.apply(item.element);
                  if (!item.enter) item.leave = null;
                }
                return true;
              }
              bcr = item.triggerElement.getBoundingClientRect();
              elementTop = top + Math.floor(bcr.top);
              elementBottom = elementTop + bcr.height;
              if (item.initialState !== null) {
                state = item.initialState;
                item.initialState = null;
              } else {
                switch (item.mode) {
                  case 1:
                  default:
                    state = bottom > elementTop - item.offset && top < elementBottom + item.offset;
                    break;
                  case 2:
                    a = top + height * 0.5;
                    state = a > elementTop - item.offset && a < elementBottom + item.offset;
                    break;
                  case 3:
                    a = top + height * item.threshold;
                    if (a - height * 0.375 <= 0) a = 0;
                    b = top + height * (1 - item.threshold);
                    if (b + height * 0.375 >= document.body.scrollHeight - scrollPad)
                      b = document.body.scrollHeight + scrollPad;
                    state = b > elementTop - item.offset && a < elementBottom + item.offset;
                    break;
                  case 4:
                    pad = height * item.threshold;
                    viewportTop = top + pad;
                    viewportBottom = bottom - pad;
                    if (Math.floor(top) <= pad) viewportTop = top;
                    if (Math.ceil(bottom) >= document.body.scrollHeight - pad) viewportBottom = bottom;
                    if (viewportBottom - viewportTop >= elementBottom - elementTop) {
                      state =
                        (elementTop >= viewportTop && elementBottom <= viewportBottom) ||
                        (elementTop >= viewportTop && elementTop <= viewportBottom) ||
                        (elementBottom >= viewportTop && elementBottom <= viewportBottom);
                    } else
                      state =
                        (viewportTop >= elementTop && viewportBottom <= elementBottom) ||
                        (elementTop >= viewportTop && elementTop <= viewportBottom) ||
                        (elementBottom >= viewportTop && elementBottom <= viewportBottom);
                    break;
                }
              }
              if (state != item.state) {
                item.state = state;
                if (item.state) {
                  if (item.enter) {
                    item.enter.apply(item.element);
                    if (!item.leave) item.enter = null;
                  }
                } else {
                  if (item.leave) {
                    item.leave.apply(item.element);
                    if (!item.enter) item.leave = null;
                  }
                }
              }
            });
          },
          init: function () {
            on('load', this.handler);
            on('resize', this.handler);
            on('scroll', this.handler);
            this.handler();
          },
        };
        scrollEvents.init();
        var scrollTracking = {
          elements: [],
          add: function (selector) {
            var _this = this;
            $$(selector).forEach(function (e) {
              _this.elements.push(e);
            });
          },
          resizeHandler: function () {
            this.elements.forEach(function (e) {
              e.style.setProperty('--element-top', e.offsetTop);
            });
          },
          scrollHandler: function () {
            document.documentElement.style.setProperty('--scroll-y', window.scrollY);
          },
          init: function () {
            var _this = this;
            on('scroll', function () {
              _this.scrollHandler();
            });
            on('load', function () {
              _this.scrollHandler();
            });
            this.scrollHandler();
            on('resize', function () {
              _this.resizeHandler();
            });
            on('load', function () {
              _this.resizeHandler();
            });
            this.resizeHandler();
            let x = new ResizeObserver(function (entries) {
              _this.scrollHandler();
              _this.resizeHandler();
            });
            x.observe($body);
          },
        };
        scrollTracking.init();
        (function () {
          var items = $$('.deferred'),
            loadHandler,
            enterHandler;
          loadHandler = function () {
            var i = this,
              p = this.parentElement,
              duration = 375;
            if (i.dataset.src !== 'done') return;
            if (Date.now() - i._startLoad < duration) duration = 175;
            i.style.transitionDuration = duration / 1000.0 + 's';
            p.classList.remove('loading');
            i.style.opacity = 1;
            setTimeout(function () {
              i.style.backgroundImage = 'none';
              i.style.transitionProperty = '';
              i.style.transitionTimingFunction = '';
              i.style.transitionDuration = '';
            }, duration);
          };
          enterHandler = function () {
            var i = this,
              p = this.parentElement,
              src;
            src = i.dataset.src;
            i.dataset.src = 'done';
            p.classList.add('loading');
            i._startLoad = Date.now();
            i.src = src;
          };
          items.forEach(function (p) {
            var i = p.firstElementChild;
            if (!p.classList.contains('enclosed')) {
              p.style.backgroundImage = 'url(' + i.src + ')';
              p.style.backgroundSize = '100% 100%';
              p.style.backgroundPosition = 'top left';
              p.style.backgroundRepeat = 'no-repeat';
            }
            i.style.opacity = 0;
            i.style.transitionProperty = 'opacity';
            i.style.transitionTimingFunction = 'ease-in-out';
            i.addEventListener('load', loadHandler);
            scrollEvents.add({ element: i, enter: enterHandler, offset: 250 });
          });
        })();
        var onvisible = {
          effects: {
            'blur-in': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'filter ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.opacity = 0;
                this.style.filter = 'blur(' + 0.25 * intensity + 'rem)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.filter = 'none';
              },
            },
            'zoom-in': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transform = 'scale(' + (1 - (alt ? 0.25 : 0.05) * intensity) + ')';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'zoom-out': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transform = 'scale(' + (1 + (alt ? 0.25 : 0.05) * intensity) + ')';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'slide-left': {
              type: 'transition',
              transition: function (speed, delay) {
                return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
              },
              rewind: function () {
                this.style.transform = 'translateX(100vw)';
              },
              play: function () {
                this.style.transform = 'none';
              },
            },
            'slide-right': {
              type: 'transition',
              transition: function (speed, delay) {
                return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
              },
              rewind: function () {
                this.style.transform = 'translateX(-100vw)';
              },
              play: function () {
                this.style.transform = 'none';
              },
            },
            'flip-forward': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transformOrigin = '50% 50%';
                this.style.transform = 'perspective(1000px) rotateX(' + (alt ? 45 : 15) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'flip-backward': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transformOrigin = '50% 50%';
                this.style.transform = 'perspective(1000px) rotateX(' + (alt ? -45 : -15) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'flip-left': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transformOrigin = '50% 50%';
                this.style.transform = 'perspective(1000px) rotateY(' + (alt ? 45 : 15) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'flip-right': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transformOrigin = '50% 50%';
                this.style.transform = 'perspective(1000px) rotateY(' + (alt ? -45 : -15) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'tilt-left': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transform = 'rotate(' + (alt ? 45 : 5) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'tilt-right': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity, alt) {
                this.style.opacity = 0;
                this.style.transform = 'rotate(' + (alt ? -45 : -5) * intensity + 'deg)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'fade-right': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.opacity = 0;
                this.style.transform = 'translateX(' + -1.5 * intensity + 'rem)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'fade-left': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.opacity = 0;
                this.style.transform = 'translateX(' + 1.5 * intensity + 'rem)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'fade-down': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.opacity = 0;
                this.style.transform = 'translateY(' + -1.5 * intensity + 'rem)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'fade-up': {
              type: 'transition',
              transition: function (speed, delay) {
                return (
                  'opacity ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.opacity = 0;
                this.style.transform = 'translateY(' + 1.5 * intensity + 'rem)';
              },
              play: function () {
                this.style.opacity = 1;
                this.style.transform = 'none';
              },
            },
            'fade-in': {
              type: 'transition',
              transition: function (speed, delay) {
                return 'opacity ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'fade-in-background': {
              type: 'manual',
              rewind: function () {
                this.style.removeProperty('--onvisible-delay');
                this.style.removeProperty('--onvisible-background-color');
              },
              play: function (speed, delay) {
                this.style.setProperty('--onvisible-speed', speed + 's');
                if (delay) this.style.setProperty('--onvisible-delay', delay + 's');
                this.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
              },
            },
            'zoom-in-image': {
              type: 'transition',
              target: 'img',
              transition: function (speed, delay) {
                return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
              },
              rewind: function () {
                this.style.transform = 'scale(1)';
              },
              play: function (intensity) {
                this.style.transform = 'scale(' + (1 + 0.1 * intensity) + ')';
              },
            },
            'zoom-out-image': {
              type: 'transition',
              target: 'img',
              transition: function (speed, delay) {
                return 'transform ' + speed + 's ease' + (delay ? ' ' + delay + 's' : '');
              },
              rewind: function (intensity) {
                this.style.transform = 'scale(' + (1 + 0.1 * intensity) + ')';
              },
              play: function () {
                this.style.transform = 'none';
              },
            },
            'focus-image': {
              type: 'transition',
              target: 'img',
              transition: function (speed, delay) {
                return (
                  'transform ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '') +
                  ', ' +
                  'filter ' +
                  speed +
                  's ease' +
                  (delay ? ' ' + delay + 's' : '')
                );
              },
              rewind: function (intensity) {
                this.style.transform = 'scale(' + (1 + 0.05 * intensity) + ')';
                this.style.filter = 'blur(' + 0.25 * intensity + 'rem)';
              },
              play: function (intensity) {
                this.style.transform = 'none';
                this.style.filter = 'none';
              },
            },
            'wipe-up': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '100% 0%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                  { maskSize: '110% 110%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '0% 100%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'wipe-down': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '100% 0%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                  { maskSize: '110% 110%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '0% 0%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'wipe-left': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '0% 100%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                  { maskSize: '110% 110%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '100% 0%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'wipe-right': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '0% 100%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                  { maskSize: '110% 110%', maskImage: 'linear-gradient(90deg, black 100%, transparent 100%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '0% 0%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'wipe-diagonal': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '0% 0%', maskImage: 'linear-gradient(45deg, black 50%, transparent 50%)' },
                  { maskSize: '220% 220%', maskImage: 'linear-gradient(45deg, black 50%, transparent 50%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '0% 100%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'wipe-reverse-diagonal': {
              type: 'animate',
              keyframes: function (intensity) {
                return [
                  { maskSize: '0% 0%', maskImage: 'linear-gradient(135deg, transparent 50%, black 50%)' },
                  { maskSize: '220% 220%', maskImage: 'linear-gradient(135deg, transparent 50%, black 50%)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1, easing: 'ease' };
              },
              rewind: function () {
                this.style.opacity = 0;
                this.style.maskComposite = 'exclude';
                this.style.maskRepeat = 'no-repeat';
                this.style.maskPosition = '100% 100%';
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'pop-in': {
              type: 'animate',
              keyframes: function (intensity) {
                let diff = (intensity + 1) * 0.025;
                return [
                  { opacity: 0, transform: 'scale(' + (1 - diff) + ')' },
                  { opacity: 1, transform: 'scale(' + (1 + diff) + ')' },
                  { opacity: 1, transform: 'scale(' + (1 - diff * 0.25) + ')', offset: 0.9 },
                  { opacity: 1, transform: 'scale(1)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1 };
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'bounce-up': {
              type: 'animate',
              keyframes: function (intensity) {
                let diff = (intensity + 1) * 0.075;
                return [
                  { opacity: 0, transform: 'translateY(' + diff + 'rem)' },
                  { opacity: 1, transform: 'translateY(' + -1 * diff + 'rem)' },
                  { opacity: 1, transform: 'translateY(' + diff * 0.25 + 'rem)', offset: 0.9 },
                  { opacity: 1, transform: 'translateY(0)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1 };
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'bounce-down': {
              type: 'animate',
              keyframes: function (intensity) {
                let diff = (intensity + 1) * 0.075;
                return [
                  { opacity: 0, transform: 'translateY(' + -1 * diff + 'rem)' },
                  { opacity: 1, transform: 'translateY(' + diff + 'rem)' },
                  { opacity: 1, transform: 'translateY(' + -1 * (diff * 0.25) + 'rem)', offset: 0.9 },
                  { opacity: 1, transform: 'translateY(0)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1 };
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'bounce-left': {
              type: 'animate',
              keyframes: function (intensity) {
                let diff = (intensity + 1) * 0.075;
                return [
                  { opacity: 0, transform: 'translateX(' + diff + 'rem)' },
                  { opacity: 1, transform: 'translateX(' + -1 * diff + 'rem)' },
                  { opacity: 1, transform: 'translateX(' + diff * 0.25 + 'rem)', offset: 0.9 },
                  { opacity: 1, transform: 'translateX(0)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1 };
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
            'bounce-right': {
              type: 'animate',
              keyframes: function (intensity) {
                let diff = (intensity + 1) * 0.075;
                return [
                  { opacity: 0, transform: 'translateX(' + -1 * diff + 'rem)' },
                  { opacity: 1, transform: 'translateX(' + diff + 'rem)' },
                  { opacity: 1, transform: 'translateX(' + -1 * (diff * 0.25) + 'rem)', offset: 0.9 },
                  { opacity: 1, transform: 'translateX(0)' },
                ];
              },
              options: function (speed) {
                return { duration: speed, iterations: 1 };
              },
              rewind: function () {
                this.style.opacity = 0;
              },
              play: function () {
                this.style.opacity = 1;
              },
            },
          },
          regex: new RegExp('([^\\s]+)', 'g'),
          add: function (selector, settings) {
            var _this = this,
              style = settings.style in this.effects ? settings.style : 'fade',
              speed = parseInt('speed' in settings ? settings.speed : 0),
              intensity = parseInt('intensity' in settings ? settings.intensity : 5),
              delay = parseInt('delay' in settings ? settings.delay : 0),
              replay = 'replay' in settings ? settings.replay : false,
              stagger =
                'stagger' in settings ? (parseInt(settings.stagger) >= 0 ? parseInt(settings.stagger) : false) : false,
              staggerOrder = 'staggerOrder' in settings ? settings.staggerOrder : 'default',
              staggerSelector = 'staggerSelector' in settings ? settings.staggerSelector : null,
              threshold = parseInt('threshold' in settings ? settings.threshold : 3),
              state = 'state' in settings ? settings.state : null,
              effect = this.effects[style],
              enter,
              leave,
              scrollEventThreshold;
            if (window.CARRD_DISABLE_ANIMATION === true) {
              if (style == 'fade-in-background')
                $$(selector).forEach(function (e) {
                  e.style.setProperty('--onvisible-background-color', 'rgba(0,0,0,0.001)');
                });
              return;
            }
            switch (threshold) {
              case 1:
                scrollEventThreshold = 0;
                break;
              case 2:
                scrollEventThreshold = 0.125;
                break;
              default:
              case 3:
                scrollEventThreshold = 0.25;
                break;
              case 4:
                scrollEventThreshold = 0.375;
                break;
              case 5:
                scrollEventThreshold = 0.475;
                break;
            }
            switch (effect.type) {
              default:
              case 'transition':
                intensity = (intensity / 10) * 1.75 + 0.25;
                enter = function (children, staggerDelay = 0) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  transitionOrig = _this.style.transition;
                  _this.style.setProperty('backface-visibility', 'hidden');
                  _this.style.transition = effect.transition.apply(_this, [
                    speed / 1000,
                    (delay + staggerDelay) / 1000,
                  ]);
                  effect.play.apply(_this, [intensity, !!children]);
                  setTimeout(
                    function () {
                      _this.style.removeProperty('backface-visibility');
                      _this.style.transition = transitionOrig;
                    },
                    (speed + delay + staggerDelay) * 2,
                  );
                };
                leave = function (children) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  transitionOrig = _this.style.transition;
                  _this.style.setProperty('backface-visibility', 'hidden');
                  _this.style.transition = effect.transition.apply(_this, [speed / 1000]);
                  effect.rewind.apply(_this, [intensity, !!children]);
                  setTimeout(function () {
                    _this.style.removeProperty('backface-visibility');
                    _this.style.transition = transitionOrig;
                  }, speed * 2);
                };
                break;
              case 'animate':
                enter = function (children, staggerDelay = 0) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  setTimeout(() => {
                    effect.play.apply(_this, []);
                    _this.animate(
                      effect.keyframes.apply(_this, [intensity]),
                      effect.options.apply(_this, [speed, delay]),
                    );
                  }, delay + staggerDelay);
                };
                leave = function (children) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  let a = _this.animate(
                    effect.keyframes.apply(_this, [intensity]),
                    effect.options.apply(_this, [speed, delay]),
                  );
                  a.reverse();
                  a.addEventListener('finish', () => {
                    effect.rewind.apply(_this, []);
                  });
                };
                break;
              case 'manual':
                enter = function (children, staggerDelay = 0) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  effect.play.apply(_this, [speed / 1000, (delay + staggerDelay) / 1000, intensity]);
                };
                leave = function (children) {
                  var _this = this,
                    transitionOrig;
                  if (effect.target) _this = this.querySelector(effect.target);
                  effect.rewind.apply(_this, [intensity, !!children]);
                };
                break;
            }
            $$(selector).forEach(function (e) {
              var children, targetElement, triggerElement;
              if (stagger !== false && staggerSelector == ':scope > *') _this.expandTextNodes(e);
              children = stagger !== false && staggerSelector ? e.querySelectorAll(staggerSelector) : null;
              if (effect.target) targetElement = e.querySelector(effect.target);
              else targetElement = e;
              if (children)
                children.forEach(function (targetElement) {
                  effect.rewind.apply(targetElement, [intensity, true]);
                });
              else effect.rewind.apply(targetElement, [intensity]);
              triggerElement = e;
              if (e.parentNode) {
                if (e.parentNode.dataset.onvisibleTrigger) triggerElement = e.parentNode;
                else if (e.parentNode.parentNode) {
                  if (e.parentNode.parentNode.dataset.onvisibleTrigger) triggerElement = e.parentNode.parentNode;
                }
              }
              scrollEvents.add({
                element: e,
                triggerElement: triggerElement,
                initialState: state,
                threshold: scrollEventThreshold,
                enter: children
                  ? function () {
                      var staggerDelay = 0,
                        childHandler = function (e) {
                          enter.apply(e, [children, staggerDelay]);
                          staggerDelay += stagger;
                        },
                        a;
                      if (staggerOrder == 'default') {
                        children.forEach(childHandler);
                      } else {
                        a = Array.from(children);
                        switch (staggerOrder) {
                          case 'reverse':
                            a.reverse();
                            break;
                          case 'random':
                            a.sort(function () {
                              return Math.random() - 0.5;
                            });
                            break;
                        }
                        a.forEach(childHandler);
                      }
                    }
                  : enter,
                leave: replay
                  ? children
                    ? function () {
                        children.forEach(function (e) {
                          leave.apply(e, [children]);
                        });
                      }
                    : leave
                  : null,
              });
            });
          },
          expandTextNodes: function (e) {
            var s, i, w, x;
            for (i = 0; i < e.childNodes.length; i++) {
              x = e.childNodes[i];
              if (x.nodeType != Node.TEXT_NODE) continue;
              s = x.nodeValue;
              s = s.replace(this.regex, function (x, a) {
                return '<text-node>' + escapeHtml(a) + '</text-node>';
              });
              w = document.createElement('text-node');
              w.innerHTML = s;
              x.replaceWith(w);
              while (w.childNodes.length > 0) {
                w.parentNode.insertBefore(w.childNodes[0], w);
              }
              w.parentNode.removeChild(w);
            }
          },
        };
        function slideshowBackground(id, settings) {
          var _this = this;
          if (!('images' in settings) || !('target' in settings)) return;
          this.id = id;
          this.wait = 'wait' in settings ? settings.wait : 0;
          this.defer = 'defer' in settings ? settings.defer : false;
          this.navigation = 'navigation' in settings ? settings.navigation : false;
          this.order = 'order' in settings ? settings.order : 'default';
          this.preserveImageAspectRatio =
            'preserveImageAspectRatio' in settings ? settings.preserveImageAspectRatio : false;
          this.transition =
            'transition' in settings
              ? settings.transition
              : { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 };
          this.images = settings.images;
          this.preload = true;
          this.locked = false;
          this.$target = $(settings.target);
          this.$wrapper = 'wrapper' in settings ? $(settings.wrapper) : null;
          this.pos = 0;
          this.lastPos = 0;
          this.$slides = [];
          this.img = document.createElement('img');
          this.preloadTimeout = null;
          this.resumeTimeout = null;
          this.transitionInterval = null;
          if (window.CARRD_DISABLE_DEFER === true) {
            this.defer = false;
            this.preload = false;
          }
          if (this.preserveImageAspectRatio && this.transition.style == 'crossfade') this.transition.style = 'fade';
          if (this.transition.delay !== false)
            switch (this.transition.style) {
              case 'crossfade':
                this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 2);
                break;
              case 'fade':
                this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 3);
                break;
              case 'instant':
              default:
                break;
            }
          if (!this.$wrapper) this.navigation = false;
          if (this.defer) {
            scrollEvents.add({
              element: this.$target,
              enter: function () {
                _this.preinit();
              },
            });
          } else {
            this.preinit();
          }
        }
        slideshowBackground.prototype.speedClassName = function (speed) {
          switch (speed) {
            case 1:
              return 'slow';
            default:
            case 2:
              return 'normal';
            case 3:
              return 'fast';
          }
        };
        slideshowBackground.prototype.preinit = function () {
          var _this = this;
          if (this.preload) {
            this.preloadTimeout = setTimeout(function () {
              _this.$target.classList.add('is-loading');
            }, this.transition.speed);
            setTimeout(function () {
              _this.init();
            }, 0);
          } else {
            this.init();
          }
        };
        slideshowBackground.prototype.init = function () {
          var _this = this,
            loaded = 0,
            hasLinks = false,
            dragStart = null,
            dragEnd = null,
            $slide,
            intervalId,
            i;
          this.$target.classList.add('slideshow-background');
          this.$target.classList.add(this.transition.style);
          if (this.navigation) {
            this.$next = document.createElement('div');
            this.$next.classList.add('nav', 'next');
            this.$next.addEventListener('click', function (event) {
              _this.stopTransitioning();
              _this.next('default');
            });
            this.$wrapper.appendChild(this.$next);
            this.$previous = document.createElement('div');
            this.$previous.classList.add('nav', 'previous');
            this.$previous.addEventListener('click', function (event) {
              _this.stopTransitioning();
              _this.previous('default');
            });
            this.$wrapper.appendChild(this.$previous);
            this.$wrapper.addEventListener('touchstart', function (event) {
              if (event.touches.length > 1) return;
              dragStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            });
            this.$wrapper.addEventListener('touchmove', function (event) {
              var dx, dy;
              if (!dragStart || event.touches.length > 1) return;
              dragEnd = { x: event.touches[0].clientX, y: event.touches[0].clientY };
              dx = dragStart.x - dragEnd.x;
              dy = dragStart.y - dragEnd.y;
              if (Math.abs(dx) < 50) return;
              event.preventDefault();
              if (dx > 0) {
                _this.stopTransitioning();
                _this.next('default');
              } else if (dx < 0) {
                _this.stopTransitioning();
                _this.previous('default');
              }
            });
            this.$wrapper.addEventListener('touchend', function (event) {
              dragStart = null;
              dragEnd = null;
            });
          }
          for (i = 0; i < this.images.length; i++) {
            if (this.preload) {
              this.$img = document.createElement('img');
              this.$img.src = this.images[i].src;
              this.$img.addEventListener('load', function (event) {
                loaded++;
              });
            }
            $slide = document.createElement('div');
            $slide.style.backgroundImage = "url('" + this.images[i].src + "')";
            $slide.style.backgroundPosition = this.images[i].position;
            $slide.style.backgroundRepeat = 'no-repeat';
            $slide.style.backgroundSize = this.preserveImageAspectRatio ? 'contain' : 'cover';
            $slide.setAttribute('role', 'img');
            $slide.setAttribute('aria-label', this.images[i].caption);
            this.$target.appendChild($slide);
            if (this.images[i].motion != 'none') {
              $slide.classList.add(this.images[i].motion);
              $slide.classList.add(this.speedClassName(this.images[i].speed));
            }
            if ('linkUrl' in this.images[i]) {
              $slide.style.cursor = 'pointer';
              $slide._linkUrl = this.images[i].linkUrl;
              hasLinks = true;
            }
            this.$slides.push($slide);
          }
          if (hasLinks)
            this.$target.addEventListener('click', function (event) {
              var slide;
              if (!('_linkUrl' in event.target)) return;
              slide = event.target;
              if ('onclick' in slide._linkUrl) {
                slide._linkUrl.onclick(event);
                return;
              }
              if ('href' in slide._linkUrl) {
                if (slide._linkUrl.href.charAt(0) == '#') {
                  window.location.href = slide._linkUrl.href;
                  return;
                }
                if ('target' in slide._linkUrl && slide._linkUrl.target == '_blank') window.open(slide._linkUrl.href);
                else window.location.href = slide._linkUrl.href;
              }
            });
          switch (this.order) {
            case 'random':
              this.pos = Math.ceil(Math.random() * this.$slides.length) - 1;
              break;
            case 'reverse':
              this.pos = this.$slides.length - 1;
              break;
            case 'default':
            default:
              this.pos = 0;
              break;
          }
          this.lastPos = this.pos;
          if (this.preload)
            intervalId = setInterval(function () {
              if (loaded >= _this.images.length) {
                clearInterval(intervalId);
                clearTimeout(_this.preloadTimeout);
                _this.$target.classList.remove('is-loading');
                _this.start();
              }
            }, 250);
          else {
            this.start();
          }
        };
        slideshowBackground.prototype.move = function (direction, activeOrder) {
          var pos, order;
          if (!activeOrder) activeOrder = this.order;
          switch (direction) {
            case 1:
              order = activeOrder;
              break;
            case -1:
              switch (activeOrder) {
                case 'random':
                  order = 'random';
                  break;
                case 'reverse':
                  order = 'default';
                  break;
                case 'default':
                default:
                  order = 'reverse';
                  break;
              }
              break;
            default:
              return;
          }
          switch (order) {
            case 'random':
              for (;;) {
                pos = Math.ceil(Math.random() * this.$slides.length) - 1;
                if (pos != this.pos) break;
              }
              break;
            case 'reverse':
              pos = this.pos - 1;
              if (pos < 0) pos = this.$slides.length - 1;
              break;
            case 'default':
            default:
              pos = this.pos + 1;
              if (pos >= this.$slides.length) pos = 0;
              break;
          }
          this.show(pos);
        };
        slideshowBackground.prototype.next = function (activeOrder) {
          this.move(1, activeOrder);
        };
        slideshowBackground.prototype.previous = function (activeOrder) {
          this.move(-1, activeOrder);
        };
        slideshowBackground.prototype.show = function (pos) {
          var _this = this;
          if (this.locked) return;
          this.lastPos = this.pos;
          this.pos = pos;
          switch (this.transition.style) {
            case 'instant':
              this.$slides[this.lastPos].classList.remove('top');
              this.$slides[this.pos].classList.add('top');
              this.$slides[this.pos].classList.add('visible');
              this.$slides[this.pos].classList.add('is-playing');
              this.$slides[this.lastPos].classList.remove('visible');
              this.$slides[this.lastPos].classList.remove('initial');
              this.$slides[this.lastPos].classList.remove('is-playing');
              break;
            case 'crossfade':
              this.locked = true;
              this.$slides[this.lastPos].classList.remove('top');
              this.$slides[this.pos].classList.add('top');
              this.$slides[this.pos].classList.add('visible');
              this.$slides[this.pos].classList.add('is-playing');
              setTimeout(function () {
                _this.$slides[_this.lastPos].classList.remove('visible');
                _this.$slides[_this.lastPos].classList.remove('initial');
                _this.$slides[_this.lastPos].classList.remove('is-playing');
                _this.locked = false;
              }, this.transition.speed);
              break;
            case 'fade':
              this.locked = true;
              this.$slides[this.lastPos].classList.remove('visible');
              setTimeout(function () {
                _this.$slides[_this.lastPos].classList.remove('is-playing');
                _this.$slides[_this.lastPos].classList.remove('top');
                _this.$slides[_this.pos].classList.add('top');
                _this.$slides[_this.pos].classList.add('is-playing');
                _this.$slides[_this.pos].classList.add('visible');
                _this.locked = false;
              }, this.transition.speed);
              break;
            default:
              break;
          }
        };
        slideshowBackground.prototype.start = function () {
          var _this = this;
          this.$slides[_this.pos].classList.add('visible');
          this.$slides[_this.pos].classList.add('top');
          this.$slides[_this.pos].classList.add('initial');
          this.$slides[_this.pos].classList.add('is-playing');
          if (this.$slides.length == 1) return;
          setTimeout(function () {
            _this.startTransitioning();
          }, this.wait);
        };
        slideshowBackground.prototype.startTransitioning = function () {
          var _this = this;
          if (this.transition.delay === false) return;
          this.transitionInterval = setInterval(function () {
            _this.next();
          }, this.transition.delay);
        };
        slideshowBackground.prototype.stopTransitioning = function () {
          var _this = this;
          clearInterval(this.transitionInterval);
          if (this.transition.resume !== false) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = setTimeout(function () {
              _this.startTransitioning();
            }, this.transition.resume);
          }
        };
        (function () {
          var $target, $slideshowBackground;
          $target = $('#container01');
          $slideshowBackground = document.createElement('div');
          $slideshowBackground.className = 'slideshow-background';
          $target.insertBefore($slideshowBackground, $target.firstChild);
          new slideshowBackground('container01', {
            target: '#container01 > .slideshow-background',
            wait: 0,
            defer: true,
            order: 'default',
            transition: { style: 'crossfade', speed: 1000, delay: 5000 },
            images: [
              {
                src: 'assets/images/container01-521743a9.jpg?v=b948d8a8',
                position: 'left',
                motion: 'right',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/container01-b163cfa3.jpg?v=b948d8a8',
                position: 'top left',
                motion: 'right',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/container01-3c80dd48.jpg?v=b948d8a8',
                position: 'center',
                motion: 'right',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/container01-223fd36a.jpg?v=b948d8a8',
                position: 'center',
                motion: 'right',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/container01-f3c8c291.jpg?v=b948d8a8',
                position: 'top left',
                motion: 'right',
                speed: 1,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow02', {
            target: '#slideshow02 .bg',
            wrapper: '#slideshow02 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 500, delay: false, resume: false },
            images: [
              {
                src: 'assets/images/slideshow02-133ba21b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow02-f5e0edfa.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow02-be357c5e.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow02-b4818dfa.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow02-3fae6042.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow03', {
            target: '#slideshow03 .bg',
            wrapper: '#slideshow03 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow03-a2105e2e.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow03-84121def.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow03-16a7051b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow03-b4818dfa.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow03-eace7f5a.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow04', {
            target: '#slideshow04 .bg',
            wrapper: '#slideshow04 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow04-ef34faac.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow04-96d4dc2b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow04-ab1c71cc.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow04-aeed9bff.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow04-3bf08381.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow04-ee546a23.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow05', {
            target: '#slideshow05 .bg',
            wrapper: '#slideshow05 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow05-5ed6ea72.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow05-799fa827.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow05-478dbc36.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow05-675673a1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow05-aca97ba5.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow06', {
            target: '#slideshow06 .bg',
            wrapper: '#slideshow06 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow06-4d4471cf.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow06-7f461d3e.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow06-3b43b9fe.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow06-8ad9f96b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow06-6d62a9c1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow06-22fccdf2.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow01', {
            target: '#slideshow01 .bg',
            wrapper: '#slideshow01 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow01-d1b94386.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow01-267b9a27.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow01-e14118c1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow08', {
            target: '#slideshow08 .bg',
            wrapper: '#slideshow08 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow08-100310ad.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow08-56827150.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow08-fd045cd0.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow14', {
            target: '#slideshow14 .bg',
            wrapper: '#slideshow14 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow14-217f84c2.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow14-19964963.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow14-18fee512.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow14-e3544600.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow25', {
            target: '#slideshow25 .bg',
            wrapper: '#slideshow25 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow25-f7dac430.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow25-73ad61a8.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow25-14806f29.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow21', {
            target: '#slideshow21 .bg',
            wrapper: '#slideshow21 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow21-5cb6b740.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow21-a6130590.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow21-c0b0121f.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow20', {
            target: '#slideshow20 .bg',
            wrapper: '#slideshow20 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 5000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow20-4aaee6c1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow20-7f2b207b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow20-6bd47bea.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow20-03005599.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow22', {
            target: '#slideshow22 .bg',
            wrapper: '#slideshow22 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3125, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow22-cf260011.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow22-297c8738.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow22-5549c6a2.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow11', {
            target: '#slideshow11 .bg',
            wrapper: '#slideshow11 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow11-e817e1ff.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow11-a7e025e0.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow23', {
            target: '#slideshow23 .bg',
            wrapper: '#slideshow23 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow23-bd507ac1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow23-63827616.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow23-fb438376.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow23-eb8565ea.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow23-9f6ad200.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow19', {
            target: '#slideshow19 .bg',
            wrapper: '#slideshow19 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3125, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow19-23b19691.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow19-c8623098.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow19-ba80d9da.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow19-ffbb26ba.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow26', {
            target: '#slideshow26 .bg',
            wrapper: '#slideshow26 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 5000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow26-bfff129e.jpg?v=b948d8a8',
                position: 'bottom',
                motion: 'up',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow26-ad04e467.jpg?v=b948d8a8',
                position: 'bottom',
                motion: 'down',
                speed: 1,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow26-5d5368f2.jpg?v=b948d8a8',
                position: 'top',
                motion: 'down',
                speed: 1,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow27', {
            target: '#slideshow27 .bg',
            wrapper: '#slideshow27 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow27-a5cb3dad.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow27-80640cd2.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow27-19e7abe2.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow18', {
            target: '#slideshow18 .bg',
            wrapper: '#slideshow18 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow18-103bfa6f.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow18-78ac90ab.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow18-aa355a77.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow15', {
            target: '#slideshow15 .bg',
            wrapper: '#slideshow15 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow15-cfe061c1.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow15-e5bcbf3e.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow15-35a2a1c4.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow15-f17d826b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow07', {
            target: '#slideshow07 .bg',
            wrapper: '#slideshow07 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow07-214f3ace.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow07-3d343744.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow07-e513748d.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow07-7b0374ad.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow10', {
            target: '#slideshow10 .bg',
            wrapper: '#slideshow10 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow10-f52ebfe6.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow10-c4bc735d.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow10-54b1937a.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow10-8214bee7.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow09', {
            target: '#slideshow09 .bg',
            wrapper: '#slideshow09 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow09-8be9518d.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow09-151701ad.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow09-b485f29b.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow09-aa7ef259.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow12', {
            target: '#slideshow12 .bg',
            wrapper: '#slideshow12 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3125, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow12-f2d83726.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow12-3a284261.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow12-cf3771cd.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow12-4238c206.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow17', {
            target: '#slideshow17 .bg',
            wrapper: '#slideshow17 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow17-b0c3e514.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow17-5ca89d01.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow17-8b802f96.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow17-15b6e192.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow13', {
            target: '#slideshow13 .bg',
            wrapper: '#slideshow13 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow13-c074a1ee.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow13-7bc9a744.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow13-fa4dbe91.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow16', {
            target: '#slideshow16 .bg',
            wrapper: '#slideshow16 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 3750, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow16-b9f7cc74.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-28c62cda.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-2f2629d3.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-15cb9887.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-bbcc30a3.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-416e2d57.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-c44feda9.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow16-763f91ac.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        (function () {
          new slideshowBackground('slideshow24', {
            target: '#slideshow24 .bg',
            wrapper: '#slideshow24 > .content',
            wait: 0,
            defer: true,
            navigation: true,
            order: 'default',
            preserveImageAspectRatio: false,
            transition: { style: 'crossfade', speed: 1000, delay: 6000, resume: 12000 },
            images: [
              {
                src: 'assets/images/slideshow24-f4857783.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
              {
                src: 'assets/images/slideshow24-dc62d8d0.jpg?v=b948d8a8',
                position: 'center',
                motion: 'none',
                speed: 2,
                caption: 'Untitled',
              },
            ],
          });
        })();
        scrollTracking.add('.container-component.instance-7');
        scrollTracking.add('.container-component.instance-18');
        scrollTracking.add('.container-component.instance-30');
        scrollTracking.add('.container-component.instance-31');
        scrollTracking.add('.container-component.instance-32');
        scrollTracking.add('.container-component.instance-33');
        scrollTracking.add('.container-component.style-4');
        onvisible.add('.image-component.instance-8', {
          style: 'focus-image',
          speed: 2000,
          intensity: 4,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-38', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.gallery-component.style-5', {
          style: 'fade-right',
          speed: 1000,
          intensity: 9,
          threshold: 5,
          delay: 0,
          stagger: 250,
          staggerSelector: ':scope ul > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-96', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-8', {
          style: 'zoom-out',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 250,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.image-component.instance-7', {
          style: 'focus-image',
          speed: 2000,
          intensity: 4,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-1', {
          style: 'bounce-down',
          speed: 2000,
          intensity: 5,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: true,
        });
        onvisible.add('.image-component.instance-6', {
          style: 'focus-image',
          speed: 2000,
          intensity: 4,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.image-component.instance-2', {
          style: 'blur-in',
          speed: 1500,
          intensity: 5,
          threshold: 1,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.style-2', {
          style: 'bounce-down',
          speed: 1000,
          intensity: 5,
          threshold: 4,
          delay: 750,
          state: true,
          replay: true,
        });
        onvisible.add('.image-component.instance-1', {
          style: 'focus-image',
          speed: 2000,
          intensity: 4,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-49', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.style-5', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-99', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.image-component.instance-3', {
          style: 'blur-in',
          speed: 1500,
          intensity: 5,
          threshold: 1,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-93', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-70', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.style-1', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-7', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.container-component.instance-30', {
          style: 'blur-in',
          speed: 1250,
          intensity: 3,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.container-component.instance-31', {
          style: 'blur-in',
          speed: 1250,
          intensity: 3,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.style-4', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-15', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.style-7', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-9', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-1', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.style-9', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-98', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-4', {
          style: 'bounce-down',
          speed: 2000,
          intensity: 5,
          threshold: 3,
          delay: 250,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: true,
        });
        onvisible.add('.container-component.style-4', {
          style: 'slide-right',
          speed: 1000,
          intensity: 5,
          threshold: 1,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-17', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-14', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-2', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-23', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 0,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-16', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-18', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-13', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.icons-component.instance-12', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 3,
          delay: 1000,
          stagger: 0,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-10', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-71', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-5', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-82', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-13', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.container-component.instance-8', {
          style: 'blur-in',
          speed: 1250,
          intensity: 3,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.image-component.instance-4', {
          style: 'blur-in',
          speed: 1500,
          intensity: 5,
          threshold: 1,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-12', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 500,
          state: true,
          replay: false,
        });
        onvisible.add('.image-component.instance-5', {
          style: 'blur-in',
          speed: 1500,
          intensity: 5,
          threshold: 1,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.style-4', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-55', {
          style: 'fade-in',
          speed: 1000,
          intensity: 5,
          threshold: 3,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.buttons-component.style-2', {
          style: 'bounce-up',
          speed: 500,
          intensity: 2,
          threshold: 3,
          delay: 750,
          stagger: 125,
          staggerSelector: ':scope > li',
          state: true,
          replay: false,
        });
        onvisible.add('.container-component.style-5', {
          style: 'blur-in',
          speed: 1250,
          intensity: 3,
          threshold: 3,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-74', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-63', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-87', {
          style: 'fade-right',
          speed: 2000,
          intensity: 2,
          threshold: 2,
          delay: 0,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-90', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        onvisible.add('.text-component.instance-33', {
          style: 'fade-in',
          speed: 1000,
          intensity: 2,
          threshold: 2,
          delay: 1000,
          state: true,
          replay: false,
        });
        ready.run();
      })();
