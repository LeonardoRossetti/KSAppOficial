import { Directive, Attribute } from '@angular/core';
import { NgModel } from '@angular/forms';
    @Directive({
      selector: '[mask]',
      host: {
          '(keyup)': 'onInputChange($event)'
      },
      providers: [NgModel]
    })
    export class Mask {
        maskPattern: string;
        placeHolderCounts: number;
        dividers: string[];
        modelValue: string;
        viewValue: string;

        constructor(
            public model: NgModel,
            @Attribute("mask") maskPattern: string
        ) {
            this.dividers = maskPattern.replace(/\*/g, "").split("");
            this.dividers.push(" ");
            this.generatePattern(maskPattern);
    }

    onInputChange(event) {
        this.modelValue = this.getModelValue(event);
        let stringToFormat = this.modelValue;
        if (stringToFormat.length < 10) {
            stringToFormat = this.padString(stringToFormat);
        }

        this.viewValue = this.format(stringToFormat);
        this.writeValue(event.target, this.viewValue);
    }

    writeValue(target, value) {
        return target.value = value;
    }

    generatePattern(patternString) {
        this.placeHolderCounts = (patternString.match(/\*/g) || []).length;
        for (let i = 0; i < this.placeHolderCounts; i++) {
            patternString = patternString.replace('*', "{" + i + "}");
        }
        this.maskPattern = patternString;
    }

    format(s) {
        var formattedString = this.maskPattern;
        for (let i = 0; i < this.placeHolderCounts; i++) {
            formattedString = formattedString.replace("{" + i + "}",         s.charAt(i));
            }
            return formattedString;
        }

        padString(s) {
            var pad = "          ";
            return (s + pad).substring(0, pad.length);
        }

        getModelValue(event) {
            var modelValue = event.target.value;
            for (var i = 0; i < this.dividers.length; i++) {
                while (modelValue.indexOf(this.dividers[i]) > -1) {
                    modelValue = modelValue.replace(this.dividers[i], "");
                }
            }
            return modelValue;
        }
    }