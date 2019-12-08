// var events = [
//     {'Date': new Date(2019, 12, 7), 'Title': 'Doctor appointment at 3:25pm.'},
//     {'Date': new Date(2019, 12, 18), 'Title': 'New Garfield movie comes out!', 'Link': 'https://garfield.com'},
//     {'Date': new Date(2019, 12, 27), 'Title': '25 year anniversary', 'Link': 'https://www.google.com.au/#q=anniversary+gifts'},
//   ];
//   var settings = {};
//   var element = document.getElementById('caleandar');
//   caleandar(element, events, settings);
// function caleandar(el, data, settings){
//     var obj = new Calendar(data, settings);
//     createCalendar(obj, el);
//   }
var Elementator = /** @class */ (function () {
    function Elementator(elm) {
        if (typeof elm !== 'undefined' && elm !== null) {
            if (elm && typeof elm === 'string')
                this.el = document.createElement(elm);
            else
                this.el = elm;
        }
    }
    Elementator.init = function (elm) {
        return new Elementator(elm);
    };
    Elementator.svg = function (elm) {
        return new Elementator(null).__svg(elm);
    };
    Elementator.prototype.__splitClass = function () {
        if (this.el instanceof HTMLElement) {
            return this.el.className.split(' ');
        }
        return [];
    };
    Elementator.prototype.__joinClass = function (classList) {
        if (this.el instanceof HTMLElement) {
            var joinclass = classList.join(' ');
            this.el.className = /^\s[\w\d\s\-_]+/.test(joinclass) ? joinclass.replace(' ', '') : joinclass;
        }
    };
    Elementator.prototype.addClass = function (className) {
        var classList = this.__splitClass();
        if (classList.indexOf(className) == -1) {
            classList.push(className);
            this.__joinClass(classList);
        }
        return this;
    };
    Elementator.prototype.children = function (func) {
        if (this.el instanceof HTMLElement) {
            for (var i = 0; i < this.el.children.length; i++) {
                func(new Elementator(this.el.children[i]), i);
            }
        }
    };
    Elementator.prototype.getClass = function () {
        return this.__splitClass();
    };
    Elementator.prototype.hasClass = function (className) {
        return this.__splitClass().indexOf(className) === -1 ? false : true;
    };
    Elementator.prototype.removeClass = function (className) {
        var classList = this.__splitClass();
        if (classList.indexOf(className) >= 0) {
            var index = classList.indexOf(className);
            classList.splice(index, 1);
            this.__joinClass(classList);
        }
        return this;
    };
    Elementator.prototype.addStyle = function (key, val) {
        if (this.el instanceof HTMLElement) {
            this.el.style[key] = val;
        }
        return this;
    };
    Elementator.prototype.getElement = function () {
        return this.el;
    };
    Elementator.prototype.inElement = function (txt, cond) {
        if (cond === void 0) { cond = null; }
        if (cond && cond === 'push-end')
            this.el.innerHTML += typeof txt === 'number' ? txt + '' : txt;
        else
            this.el.innerHTML = typeof txt === 'number' ? txt + '' : txt;
    };
    Elementator.prototype.setChild = function (el) {
        this.el.appendChild(el.getElement());
    };
    Elementator.prototype.__svg = function (elm) {
        if (elm && typeof elm === 'string')
            this.el = document.createElementNS('http://www.w3.org/2000/svg', elm);
        else
            this.el = elm;
        return this;
    };
    Elementator.prototype.attrNS = function (ns, name, val) {
        this.el.setAttributeNS(ns, name, val + '');
        return this;
    };
    Elementator.prototype.attr = function (name, val) {
        this.el.setAttribute(name, val + '');
        return this;
    };
    return Elementator;
}());
var ElementCalendar = /** @class */ (function () {
    function ElementCalendar(date, settings) {
        if (date === void 0) { date = null; }
        // Default Values
        this.MonthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.DayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var selectDate = null;
        if (!date)
            selectDate = new Date();
        if (typeof date === 'string')
            selectDate = new Date(date);
        else
            selectDate = date;
        this.__setSelectedDate(selectDate);
        this.options = Object.create(null);
        for (var key in settings) {
            if (key === 'styles') {
                var styles = settings[key];
                for (var style_key in styles) {
                    if (typeof this.options.styles === 'undefined')
                        this.options.styles = Object.create(null);
                    this.options.styles[style_key] = styles[style_key];
                }
            }
        }
    }
    ElementCalendar.prototype.__setSelectedDate = function (date) {
        this.Selected = Object.create(null);
        this.Selected.fulldate = date;
        this.Selected.date = date.getDate();
        this.Selected.month = date.getMonth();
        this.Selected.year = date.getFullYear();
        var firstofdate = new Date(this.Selected.year, this.Selected.month, 1);
        this.Selected.firstday = firstofdate.getDay();
        var endofdate = new Date(this.Selected.year, (this.Selected.month + 1), 0);
        this.Selected.enddate = endofdate.getDate();
        var endofdatelastmonth = new Date(this.Selected.year, (this.Selected.month - 1), 0);
        var lastmonstenddate = endofdatelastmonth.getDate();
        this.Selected.lastmonthstart = this.Selected.firstday === 0 ? 0 : (lastmonstenddate - this.Selected.firstday + 1);
    };
    ElementCalendar.prototype.changeMonth = function (num) {
        var month = this.Selected.month + num;
        return new Date(this.Selected.year, month, this.Selected.date);
    };
    ElementCalendar.prototype.event = function () {
    };
    ElementCalendar.prototype.__createDateList = function () {
        var days = Elementator.init('ul');
        days.addClass('cld-days');
        this.__createItemDateList(days);
        return days;
    };
    ElementCalendar.prototype.__createItemDateList = function (days) {
        // start date
        var date = 1;
        var nextdate = 1;
        var lastdatestart = this.Selected.lastmonthstart;
        var storagedate = [];
        for (var i = 0; i < 42; i++) {
            var list = Elementator.init('li');
            list.addClass('cld-day');
            if (typeof this.options.styles !== 'undefined' && typeof this.options.styles.date !== 'undefined') {
                var styles = this.options.styles.date;
                for (var key in styles) {
                    list.addStyle(key, styles[key]);
                }
            }
            if (this.Selected.firstday !== 0 && i < this.Selected.firstday) {
                storagedate.push({ date: lastdatestart, status: 'prev' });
                list.inElement(lastdatestart++);
                list.addClass('prevMonth');
            }
            if (i >= this.Selected.firstday && i < (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: date, status: 'current' });
                list.inElement(date++);
                list.addClass('currMonth');
                if (date === this.Selected.date)
                    list.addClass('today');
            }
            if (i >= (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: nextdate, status: 'next' });
                list.inElement(nextdate++);
                list.addClass('nextMonth');
            }
            days.setChild(list);
        }
        this.StorageDate = storagedate;
    };
    ElementCalendar.prototype.__headerNav = function () {
        var headerNV = Elementator.init('div').addClass('cld-datetime');
        var navLeft = Elementator.init('div').addClass('cld-rwd').addClass('cld-nav');
        var today = Elementator.init('div').addClass('today');
        var navRight = Elementator.init('div').addClass('cld-fwd').addClass('cld-nav');
        var iconLeft = Elementator.svg('svg').attr('height', 15).attr('width', 15);
        iconLeft.attr('viewBox', '0 0 75 100').attr('fill', 'rgba(0,0,0,0.5)');
        var iconLine = Elementator.svg('polyline').attr('points', '0,50 75,0 75,100');
        iconLeft.setChild(iconLine);
        navLeft.setChild(iconLeft);
        var iconRight = Elementator.svg('svg').attr('height', 15).attr('width', 15);
        iconRight.attr('viewBox', '0 0 75 100').attr('fill', 'rgba(0,0,0,0.5)');
        var iconLineRight = Elementator.svg('polyline').attr('points', '0,0 75,50 0,100');
        iconRight.setChild(iconLineRight);
        navRight.setChild(iconRight);
        today.inElement('December, 2019');
        headerNV.setChild(navLeft);
        headerNV.setChild(today);
        headerNV.setChild(navRight);
        iconLeft.getElement().addEventListener('click', this.___setLeftClick.bind(this));
        iconRight.getElement().addEventListener('click', this.___setRightClick.bind(this));
        return headerNV;
    };
    ElementCalendar.prototype.___setLeftClick = function () {
        this.__setSelectedDate(this.changeMonth(-1));
        this.__reCreate();
    };
    ElementCalendar.prototype.___setRightClick = function () {
        this.__setSelectedDate(this.changeMonth(1));
        this.__reCreate();
    };
    ElementCalendar.prototype.__reCreate = function () {
        var _this = this;
        this.MainSection.children(function (child) {
            if (child.hasClass('cld-days')) {
                child.inElement("");
                _this.__createItemDateList(child);
            }
        });
    };
    ElementCalendar.prototype.create = function (el) {
        var element = Elementator.init(el);
        var main = Elementator.init('div').addClass('cld-main');
        main.setChild(this.__headerNav());
        main.setChild(this.__createDateList());
        this.MainSection = main;
        element.setChild(main);
    };
    return ElementCalendar;
}());
