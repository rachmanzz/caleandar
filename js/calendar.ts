interface option {
    Color: String,
    LinkColor: String,
    NavShow: Boolean,
    NavVertical: Boolean,
    NavLocation: String,
    DateTimeShow: Boolean,
    DateTimeFormat: String,
    DatetimeLocation: String,
    EventClick: void,
    EventTargetWholeDay: Boolean,
    DisabledDays: Array<void>,
    ModelChange: object
}

class Calendars {
    Options: option
    Model: object
    Today: Date
    Selected: Date
    
    
    constructor (model: object, options: option, date: Date) {
        // Default Values
        this.Options = {
            Color: '',
            LinkColor: '',
            NavShow: true,
            NavVertical: false,
            NavLocation: '',
            DateTimeShow: true,
            DateTimeFormat: 'mmm, yyyy',
            DatetimeLocation: '',
            EventClick: null,
            EventTargetWholeDay: false,
            DisabledDays: [],
            ModelChange: model
        }
        // Overwriting default values
        for(var key in options){
            this.Options[key] = typeof options[key] == 'string' ? options[key].toLowerCase() : options[key]
        }

        // need to check again
        this.Model = model ? model : {}

        let Today : Date = new Date()

        this.Today = Today
        this.Selected = Today

    }

}