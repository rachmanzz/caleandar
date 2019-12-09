const isDefine = function (v: any) : boolean { return typeof v !== 'undefined' },
isString = function (v: any) : boolean { return isDefine(v) && typeof v === 'string' },
isNumber = function (v: any) : boolean { return isDefine(v) && typeof v === 'number' },
isFunc   = function (v: any) : boolean { return isDefine(v) && typeof v === 'function' },
isBoolean = function (v: any) : boolean { return isDefine(v) && typeof v === 'boolean' },
isArray  = function (v: any) : boolean { return isDefine(v) && Array.isArray(v) },
isObject = function (v: any) : boolean { return isDefine(v) && !isArray(v) && typeof v === 'object' }

class Elementator {
    el: HTMLElement | SVGElement
    constructor (elm: any) {
        if (typeof elm !== 'undefined' && elm !== null) {
            if (elm && typeof elm === 'string') this.el = document.createElement(elm)
            else this.el = elm
        }
    }

    static init (elm: any) : Elementator {
        return new Elementator(elm)
    }

    static svg (elm: any): Elementator {
        return new Elementator(null).__svg(elm)
    }

    

    __splitClass(): Array<string> {
        if (this.el instanceof HTMLElement) {
            return this.el.className.split(' ')
        }
        return []
    }

    __joinClass(classList: Array<string>): void {
        if (this.el instanceof HTMLElement) {
            let joinclass = classList.join(' ')
            this.el.className = /^\s[\w\d\s\-_]+/.test(joinclass) ? joinclass.replace(' ', '') : joinclass
        }
    }

    addClass (className: string): Elementator {
        const classList = this.__splitClass()
        if (classList.indexOf(className) == -1) {
            classList.push(className)
            this.__joinClass(classList)
        }
        return this
    }

    children (func : any) {
        if (this.el instanceof HTMLElement) {
            for (let i = 0; i < this.el.children.length; i++) {
                func(new Elementator(this.el.children[i]), i)
            }
        }
    }

    getClass (): any {
        return this.__splitClass()
    }

    hasClass (className: string): boolean {
        return this.__splitClass().indexOf(className) === -1 ? false : true
    }

    removeClass (className: string): Elementator {
        const classList = this.__splitClass()
        if (classList.indexOf(className) >= 0) {
            const index = classList.indexOf(className)
            classList.splice(index, 1)
            this.__joinClass(classList)
        }
        return this
    }

    addStyle (key: any, val: string): Elementator {
        if (this.el instanceof HTMLElement) {
            this.el.style[key] = val
        }
        return this
    }


    getElement (): HTMLElement | SVGElement {
        return this.el
    }

    inElement (txt: string | number, cond: string = null) : void {
        if(cond && cond === 'push-end') this.el.innerHTML += typeof txt === 'number' ? txt + '' : txt
        else this.el.innerHTML = typeof txt === 'number' ? txt + '' : txt
    }
    setChild (el: Elementator) : void {
        this.el.appendChild(el.getElement())
    }




    __svg (elm: any): Elementator {
        if (elm && typeof elm === 'string') this.el = document.createElementNS( 'http://www.w3.org/2000/svg', elm)
        else this.el = elm
        return this
    }

    attrNS (ns: string, name: string, val: string | number): Elementator {
        this.el.setAttributeNS(ns, name, val + '')
        return this
    }
    attr (name: string, val: string | number) : Elementator {
        this.el.setAttribute(name, val + '');
        return this
    }
}

interface option {
    styles: itemStyle,
    templates: templateItem,
    onclick: clickItem
}

interface selectItem {
    fulldate: Date,
    date: number,
    firstday: number,
    month: number,
    year: number,
    enddate: number,
    lastmonthstart: number
}

// template item
// today: any
// selectedDay: any,
// date: any
interface templateItem {
    [index: string]: any
}

// currentMonth, prevMonth, date, nextMonth, today, selectedDay
interface itemStyle {
    [index: string]: anyObject,
}

interface anyObject {
    [index: string]: any
}

interface storagedateitem {
    date: number,
    status: string
}
interface clickItem {
    [index: string]: any
}

interface settings {
    styles: itemStyle,
    templates: templateItem,
    onclick: clickItem
}

class ElementCalendar {
    MonthLabels: Array<string>
    DayLabels: Array<string>
    options: option
    Selected: selectItem
    StorageDate: Array<storagedateitem>
    MainSection: Elementator
    customElement: any
    TitleDate: Elementator
    ListDateElement: Elementator
    CoreElement: Elementator

    constructor (date: Date = null, settings: settings) {
        // Default Values
        this.MonthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        this.DayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        let selectDate : Date = null
        if (!date) selectDate = new Date()
        if (typeof date === 'string') selectDate = new Date(date)
        else selectDate = date
        
        this.__setSelectedDate(selectDate)
        this.options = Object.create(null)

        for (let key in settings) {
            if (key === 'styles') {
                let styles = settings[key]
                for (let style_key in styles) {
                    if (typeof this.options.styles === 'undefined') this.options.styles = Object.create(null)
                    this.options.styles[style_key] = styles[style_key]
                }
            }
            if (key === 'templates') {
                let templates = settings[key]
                for (let template_key in templates) {
                    if (typeof this.options.templates === 'undefined') this.options.templates = Object.create(null)
                    this.options.templates[template_key] = templates[template_key]
                }
            }

            if (key === 'onclick') {
                let onclick = settings[key]
                for (let click_key in onclick) {
                    if (typeof this.options.onclick === 'undefined') this.options.onclick = Object.create(null)
                    this.options.onclick[click_key] = onclick[click_key]
                }
            }
        }
        
    }

    // 0001 helper to set, get and update date

    private __isCurrentDate(): boolean {
        const current: Date = new Date()
        if (this.Selected.year === current.getFullYear() && this.Selected.month === current.getMonth() && this.Selected.date === current.getDate()) {
            return true
        }
        return false
    }

    private __setSelectedDate (date: Date): void {
        this.Selected = Object.create(null)
        this.Selected.fulldate = date
        this.Selected.date = date.getDate()
        this.Selected.month = date.getMonth()
        this.Selected.year = date.getFullYear()
        
        const firstofdate: Date = new Date(this.Selected.year, this.Selected.month, 1)
        this.Selected.firstday = firstofdate.getDay()

        const endofdate: Date = new Date(this.Selected.year, (this.Selected.month + 1), 0)
        this.Selected.enddate = endofdate.getDate()

        const endofdatelastmonth = new Date(this.Selected.year, (this.Selected.month - 1), 0)
        const lastmonstenddate = endofdatelastmonth.getDate()
        this.Selected.lastmonthstart = this.Selected.firstday === 0 ? 0 : (lastmonstenddate - this.Selected.firstday + 1)
    }

    private __changeMonth (num: number) : Date {
        const month: number = this.Selected.month + num
        return new Date(this.Selected.year, month, this.Selected.date)
    }

    // 0001 end helper

    // item of calender
    private __headerNav (): Elementator {
        const headerNV: Elementator = Elementator.init('div').addClass('cld-datetime')
        const navLeft: Elementator = Elementator.init('div').addClass('cld-rwd').addClass('cld-nav')
        const today: Elementator = Elementator.init('div').addClass('today')
        const navRight: Elementator = Elementator.init('div').addClass('cld-fwd').addClass('cld-nav')


        const iconLeft: Elementator = Elementator.svg('svg').attr('height', 15).attr('width', 15)
        iconLeft.attr('viewBox', '0 0 75 100').attr('fill', 'rgba(0,0,0,0.5)')
        const iconLine: Elementator = Elementator.svg('polyline').attr('points', '0,50 75,0 75,100')
        iconLeft.setChild(iconLine)
        navLeft.setChild(iconLeft)


        const iconRight: Elementator = Elementator.svg('svg').attr('height', 15).attr('width', 15)
        iconRight.attr('viewBox', '0 0 75 100').attr('fill', 'rgba(0,0,0,0.5)')
        const iconLineRight: Elementator = Elementator.svg('polyline').attr('points', '0,0 75,50 0,100')
        iconRight.setChild(iconLineRight)
        navRight.setChild(iconRight)

        this.TitleDate = today
        const month : String = this.MonthLabels[this.Selected.month]
        this.TitleDate.inElement(month + ', ' + this.Selected.year)
        
        headerNV.setChild(navLeft)
        headerNV.setChild(this.TitleDate)
        headerNV.setChild(navRight)

        iconLeft.getElement().addEventListener('click', this.___setLeftClick.bind(this))

        iconRight.getElement().addEventListener('click', this.___setRightClick.bind(this))


        return headerNV
    }

    private __dayLabels () : Elementator {
        const labelElm: Elementator = Elementator.init('ul').addClass('cld-labels')
        const labels: Array<string> = this.DayLabels
        const size = labels.length
        for (let i = 0; i < size; i++) {
            let labelDay: Elementator = Elementator.init('li').addClass('cld-label')
            labelDay.inElement(labels[i])
            labelElm.setChild(labelDay)
        }
        return labelElm
    }

    private __createDateList (): Elementator {
        const days : Elementator = Elementator.init('ul')
        if (!isDefine(this.ListDateElement)) this.ListDateElement = days
        days.addClass('cld-days')
        this.__createItemDateList(days)
        return days
    }

    private __createItemDateList (days: Elementator): void {
        // start date
        let date = 1
        let nextdate = 1
        let lastdatestart = this.Selected.lastmonthstart
        let storagedate: Array<storagedateitem> = []
        for (let i = 0; i < 42; i++) {
            const list : Elementator = Elementator.init('li')
            list.addClass('cld-day')
            
            if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.date !== 'undefined') {
                let styles = this.options.styles.date
                for (let key in styles) {
                    list.addStyle(key, styles[key])
                }
            }

            // prev month
            if (this.Selected.firstday !== 0 && i < this.Selected.firstday) {
                storagedate.push({ date:  lastdatestart, status: 'prev'})
                if(isDefine(this.options.templates) && isDefine(this.options.templates.date)) {
                    list.inElement(this.options.templates.date(lastdatestart++))
                } else list.inElement(lastdatestart++)
                
                list.addClass('prevMonth')
                if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.prevMonth !== 'undefined') {
                    let styles = this.options.styles.prevMonth
                    for (let key in styles) {
                        list.addStyle(key, styles[key])
                    }
                }
            }
            // current month
            if (i >= this.Selected.firstday && i < (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date:  date, status: 'current'})

                if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.currentMonth !== 'undefined') {
                    let styles = this.options.styles.currentMonth
                    for (let key in styles) {
                        list.addStyle(key, styles[key])
                    }
                }


                if(isDefine(this.options.templates) && isDefine(this.options.templates.date)) {
                    list.inElement(this.options.templates.date(date++))
                } else list.inElement(date++)
                list.addClass('currMonth')

                if (date === this.Selected.date && this.__isCurrentDate()) {
                    list.addClass('today')
                    if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.today !== 'undefined') {
                        let styles = this.options.styles.today
                        for (let key in styles) {
                            list.addStyle(key, styles[key])
                        }
                    }
                }
                else {
                    if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.currentMonth !== 'undefined') {
                        let styles = this.options.styles.currentMonth
                        for (let key in styles) {
                            list.addStyle(key, styles[key])
                        }
                    }
                }

                if (isDefine(this.options.onclick) && isFunc(this.options.onclick.date)) {
                    list.getElement().onclick = () => this.options.onclick.date(storagedate[i], new Date(this.Selected.year, this.Selected.month, storagedate[i].date))
                }
            }
            if (i >= (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: nextdate, status: 'next'})
                if(isDefine(this.options.templates) && isDefine(this.options.templates.date)) {
                    list.inElement(this.options.templates.date(nextdate++))
                } else list.inElement(nextdate++)
                list.addClass('nextMonth')
                if(typeof this.options.styles !== 'undefined' && typeof this.options.styles.nextMonth !== 'undefined') {
                    let styles = this.options.styles.nextMonth
                    for (let key in styles) {
                        list.addStyle(key, styles[key])
                    }
                }
            }
            days.setChild(list)
        }
        this.StorageDate = storagedate
    }


    private __customItemDateList (parent: Elementator, child: any): void {
        // start date
        let date = 1
        let nextdate = 1
        let lastdatestart = this.Selected.lastmonthstart
        let storagedate: Array<storagedateitem> = []
        for (let i = 0; i < 42; i++) {

            // prev month
            if (this.Selected.firstday !== 0 && i < this.Selected.firstday) {
                storagedate.push({ date:  lastdatestart, status: 'prev'})
                this.__custom(parent, child(i, lastdatestart++))
            }
            // current month
            if (i >= this.Selected.firstday && i < (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date:  date, status: 'current'})
                this.__custom(parent, child(i,date++))
            }
            if (i >= (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: nextdate, status: 'next'})
                this.__custom(parent, child(i,nextdate++))
            }
        }
        this.StorageDate = storagedate
    }

    private __customItemDateListPreRender (parent: Elementator, child: any): void {
        // start date
        let date = 1
        let nextdate = 1
        let lastdatestart = this.Selected.lastmonthstart
        let storagedate: Array<storagedateitem> = []
        for (let i = 0; i < 42; i++) {
            // prev month
            if (this.Selected.firstday !== 0 && i < this.Selected.firstday) {
                storagedate.push({ date:  lastdatestart++, status: 'prev'})
            }
            // current month
            if (i >= this.Selected.firstday && i < (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date:  date++, status: 'current'})
            }
            if (i >= (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: nextdate++, status: 'next'})
            }
        }
        child(storagedate, parent, this.__custom)
        this.StorageDate = storagedate
    }

    // end item of calendar

    // navigation action
    private ___setLeftClick () : void {
        this.__setSelectedDate(this.__changeMonth(-1))
        const month : String = this.MonthLabels[this.Selected.month]
        this.TitleDate.inElement(month + ', ' + this.Selected.year)
        this.__reCreate()
    }

    private ___setRightClick () : void {
        this.__setSelectedDate(this.__changeMonth(1))
        const month : String = this.MonthLabels[this.Selected.month]
        this.TitleDate.inElement(month + ', ' + this.Selected.year)
        this.__reCreate()
    }


    // navigation action
    private ___customSetLeftClick () : void {
        this.__setSelectedDate(this.__changeMonth(-1))
        this.__customReCreate()
    }

    private ___customSetRightClick () : void {
        this.__setSelectedDate(this.__changeMonth(1))
        this.__customReCreate()
    }

    // render item
    private __reCreate () {
        // if (isDefine(this.MainSection)) {
        //     this.MainSection.children(child => {
        //         if(child.hasClass('cld-days')) {
        //             child.inElement("")
        //             this.__createItemDateList(child)
        //         }
        //     })
        // }

        if (isDefine(this.ListDateElement)) {
            this.ListDateElement.inElement("") // clear inner element
            this.__createItemDateList(this.ListDateElement)
        }
    }

    private __customReCreate () {
        this.CoreElement.inElement('')
        this.__custom(this.CoreElement)
    }

    private __custom (parent: Elementator, child: any = null) {
        const custom = child ? child : this.customElement
        let size: number = custom.length
        
        for (let i = 0; i < size; i++) {
            let item = custom[i]
            if (isString(item.node)) {
                if (isBoolean(item.calNode) && isString(item.calItem)) {
                    if(item.calItem === 'headernav') parent.setChild(this.__headerNav())
                    if(item.calItem === 'datelist') parent.setChild(this.__createDateList())
                } else {
                    let nodeElm: Elementator = isBoolean(item.svg) && item.svg ? Elementator.svg(item.node) : Elementator.init(item.node)
                    if (isBoolean(item.svg) && item.svg) {
                        if(isArray(item.attrNS)) {
                            let attrSize = item.attrNS.length
                            for (let l = 0; l < attrSize; l++) {
                                let attrItem = item.attrNS[i]
                                if (isString(attrItem.ns) && isString(attrItem.name) && isString(attrItem.value) || isNumber(attrItem.value)) {
                                    nodeElm.attrNS(attrItem.ns, attrItem.name, attrItem.value)
                                }
                            }
                        }
                    } else {
                        if(isArray(item.className)) {
                            let clasSize = item.className.length
                            for (let j = 0; j < clasSize; j++) {
                                nodeElm.addClass(item.className[j])
                            }
                        }
                        if(isObject(item.styles)) {
                            for (let style_key in item.styles) {
                                let val = item.styles[style_key]
                                nodeElm.addStyle(style_key, val)
                            }
                        }
                    }

                    if(isArray(item.attr)) {
                        let attrSize = item.attr.length
                        for (let l = 0; l < attrSize; l++) {
                            let attrItem = item.attr[l]
                            if (isString(attrItem.name) && isString(attrItem.value)) {
                                nodeElm.attr(attrItem.name, attrItem.value)
                            }
                        }
                    }

                    if (isBoolean(item.calButton)) {
                        if (isString(item.calItem) && item.calItem === 'prevAction') {
                            nodeElm.getElement().onclick = () => { this.___customSetLeftClick() }
                        }

                        if (isString(item.calItem) && item.calItem === 'nextAction') {
                            nodeElm.getElement().onclick = () => { this.___customSetRightClick() }
                        }
                    }

                    if (isFunc(item.onclick)) {
                        nodeElm.getElement().onclick = () => item.onclick()
                    }

                    if(isArray(item.child)) {
                        let childSize = item.child.length
                        if (childSize > 0) {
                            if(isDefine(this.__custom)) this.__custom(nodeElm, item.child)
                            if(isDefine(item.render)) item.render(nodeElm, item.child)
                        }
                    }

                    if(isFunc(item.child) && isString(item.calItem) && item.calItem === 'fulldate') {
                        if(isDefine(this.__custom)) this.__custom(nodeElm, item.child(this.Selected.fulldate))
                    }

                    if (item.dateItem && item.calItem === 'childLoop' && isFunc(item.child)) {
                            this.__customItemDateList(nodeElm, item.child)
                    }

                    if (item.dateItem && item.calItem === 'prerender' && isFunc(item.render)) {
                        this.__customItemDateListPreRender(nodeElm, item.render.bind(this))
                    }

                    if (item.dateItem && item.calItem === 'render' && isFunc(item.child)) {
                        let dataEl: Array<any> = item.data
                        let datasize: number = dataEl.length
                        for (let k = 0; k < datasize; k++) {
                            item.render(nodeElm, item.child(dataEl[k]))
                        }
                        //this.__customItemDateListPreRender(nodeElm, item.render)
                    }

                    if(isString(item.html)) nodeElm.inElement(item.html)

                    parent.setChild(nodeElm)
                }
            }
        }

    }


    // public method
    custom (obj: any): ElementCalendar {
        this.customElement = obj
        return this
    }

    create(el: HTMLElement) : void {
        const element : Elementator = Elementator.init(el).addClass('NavShow-true DateTimeShow-true')
        this.CoreElement = element
        if (isDefine(this.customElement)) this.__custom(element)
        else {
            const main : Elementator = Elementator.init('div').addClass('cld-main')
            main.setChild(this.__headerNav())
            main.setChild(this.__dayLabels())
            main.setChild(this.__createDateList())
            this.MainSection = main
            element.setChild(main)
        }        
    }
}

(window as any).ElementCalendar = ElementCalendar
export default ElementCalendar