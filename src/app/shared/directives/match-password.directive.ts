import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appMatchPasswordDirective]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MatchPasswordDirective,
      multi: true,
    },
  ],
})
export class MatchPasswordDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordRepeat = control.get('passwordRepeat');
    if (password?.value !== passwordRepeat?.value) {
      passwordRepeat?.setErrors({ passwordRepeat: true });
      return { passwordRepeat: true };
    }
    return null;
  }
}
