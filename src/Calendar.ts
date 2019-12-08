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

    hasClass (className): boolean {
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

    addStyle (key: string, val: string): Elementator {
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
    styles: itemStyle
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

interface itemSetting {
    styles: itemStyle
}

interface itemStyle {
    date: object,
    currentMonth : object
    lastMonth : object,
    nextMonth : object
}

interface storagedateitem {
    date: number,
    status: string
}

class ElementCalendar {
    MonthLabels: Array<string>
    DayLabels: Array<string>
    options: option
    Selected: selectItem
    StorageDate: Array<storagedateitem>
    MainSection: Elementator
    constructor (date: Date = null, settings: itemSetting) {
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
        }
        
    }

    __setSelectedDate (date: Date): void {
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

    changeMonth (num: number) : Date {
        const month: number = this.Selected.month + num
        return new Date(this.Selected.year, month, this.Selected.date)
    }

    event (): void {

    }

    __createDateList (): Elementator {
        const days : Elementator = Elementator.init('ul')
        days.addClass('cld-days')
        this.__createItemDateList(days)
        return days
    }

    __createItemDateList (days: Elementator): void {
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


            if (this.Selected.firstday !== 0 && i < this.Selected.firstday) {
                storagedate.push({ date:  lastdatestart, status: 'prev'})
                list.inElement(lastdatestart++)
                list.addClass('prevMonth')
            }
            if (i >= this.Selected.firstday && i < (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date:  date, status: 'current'})
                list.inElement(date++)
                list.addClass('currMonth')
                if (date === this.Selected.date) list.addClass('today')
            }
            if (i >= (this.Selected.firstday + this.Selected.enddate)) {
                storagedate.push({ date: nextdate, status: 'next'})
                list.inElement(nextdate++)
                list.addClass('nextMonth')
            }
            days.setChild(list)
        }
        this.StorageDate = storagedate
    }

    __headerNav (): Elementator {
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

        today.inElement('December, 2019')
        
        headerNV.setChild(navLeft)
        headerNV.setChild(today)
        headerNV.setChild(navRight)

        iconLeft.getElement().addEventListener('click', this.___setLeftClick.bind(this))

        iconRight.getElement().addEventListener('click', this.___setRightClick.bind(this))


        return headerNV
    }

    ___setLeftClick () : void {
        this.__setSelectedDate(this.changeMonth(-1))
        this.__reCreate()
    }

    ___setRightClick () : void {
        this.__setSelectedDate(this.changeMonth(1))
        this.__reCreate()
    }

    __reCreate () {
        this.MainSection.children(child => {
            if(child.hasClass('cld-days')) {
                child.inElement("")
                this.__createItemDateList(child)
            }
        })
    }

    create(el: HTMLElement) : void {
        const element : Elementator = Elementator.init(el)
        const main : Elementator = Elementator.init('div').addClass('cld-main')
        main.setChild(this.__headerNav())
        main.setChild(this.__createDateList())
        this.MainSection = main
        element.setChild(main)
        
    }
}