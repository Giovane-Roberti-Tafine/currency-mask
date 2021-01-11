import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CurrencyMaskServiceService } from "./currency-mask-service.service";

const noop = () => { };

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CurrencyMaskDirective),
    multi: true
};

interface Options {
    prefix?: string;
    precision?: string;
}

@Directive({
    selector: '[currency-mask]',
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class CurrencyMaskDirective implements ControlValueAccessor {
    @Input() precision?: string;
    @Input() prefix?: string;

    private el: HTMLInputElement;
    private innerValue: any;

    constructor(public elementRef: ElementRef, private currencyMaskService: CurrencyMaskServiceService, private renderer: Renderer2) {
        this.el = elementRef.nativeElement;

        if (!this.precision) this.precision = '2';
    }

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (a: any) => void = noop;

    get value(): any {
        return this.innerValue;
    }

    set value(v: any) {
        console.log("setvalue" + v);
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
            this.onTouchedCallback();
        }
    }

    writeValue(value: any) {
        if (value === '' || value === undefined || value === null) {
            return;
        }
        if (value !== this.innerValue) {
            this.el.value = this.currencyMaskService.transform(value, +this.precision, this.prefix);
            if (value) {
                this.renderer.setAttribute(this.elementRef.nativeElement, 'value', value);
            }
            this.innerValue = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    ngAfterViewInit() {
        this.el.style.textAlign = 'right';
    }


    @HostListener('input', ['$event.target.value'])
    onInput(value) {
        this.innerValue = this.currencyMaskService.parse(value, +this.precision);
        this.el.value = this.currencyMaskService.transform(this.innerValue, +this.precision, this.prefix);

        if (this.innerValue) {
            this.renderer.setAttribute(this.elementRef.nativeElement, 'value', this.innerValue);
        }
        this.onChangeCallback(this.innerValue);
    }

    // Prevent user to enter anything but digits and decimal separator
    // @HostListener('keypress', ['$event'])
    // onKeyPress(event) {
    //     const key = event.which || event.keyCode || 0;
    //     // if (key === 45 && !this.allowNegative) {
    //     //     event.preventDefault();
    //     // } else if (key === 45 && this.allowNegative) {
    //     //     // allow negative numbers
    //     // } else if (key !== 46 && key > 31 && (key < 48 || key > 57)) {
    //     //     event.preventDefault();
    //     // }
    // }



}