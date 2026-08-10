import { DeliveryType } from './../../../../types/delivery.type';
import { PaymentType } from './../../../../types/payment.type ';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service ';
import { OrderType } from '../../../../types/order.type ';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../shared/services/user.service ';
import { UserInfoType } from '../../../../types/user.info.type';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-info',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './info.html',
  styleUrl: './info.css',
})
export class Info implements OnInit {
  private orderServices = inject(OrderService);
  private userServices = inject(UserService);
  private _snackbar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  userInfoForm: FormGroup = this.fb.group({
    lastName: [''],
    firstName: [''],
    fatherName: [''],
    phone: [''],
    paymentType: [PaymentType.cashToCourier],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: [''],
  });

  deliveryType = signal<DeliveryType>(DeliveryType.delivery);
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;
  notDelivery = signal<boolean>(false);

  ngOnInit(): void {
    this.userServices.getUserInfo().subscribe((data: UserInfoType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      const userInfo = data as UserInfoType;
      const paramToUpdate = {
        firstName: userInfo.firstName ? userInfo.firstName : '',
        lastName: userInfo.lastName ? userInfo.lastName : '',
        fatherName: userInfo.fatherName ? userInfo.fatherName : '',
        phone: userInfo.phone ? userInfo.phone : '',
        paymentType: userInfo.paymentType ? userInfo.paymentType : this.paymentTypes.cashToCourier,
        email: userInfo.email ? userInfo.email : '',
        street: userInfo.street ? userInfo.street : '',
        house: userInfo.house ? userInfo.house : '',
        entrance: userInfo.entrance ? userInfo.entrance : '',
        apartment: userInfo.apartment ? userInfo.apartment : '',
        comment: '',
      };
      if (userInfo.deliveryType) {
        this.deliveryType.set(userInfo.deliveryType);
        this.userInfoForm.setValue(paramToUpdate);
      }
    });
  }

  changeDeliveryType(type: DeliveryType): void {
    this.deliveryType.set(type);
    this.userInfoForm.markAsDirty();
    if (type == this.deliveryTypes.self) {
      this.notDelivery.set(true);
      // this.updateDeliveryTypeValidation();
    }
    if (type == this.deliveryTypes.delivery) {
      this.notDelivery.set(false);
      // this.updateDeliveryTypeValidation();
    }
  }
  updateUserInfo() {
    if (this.userInfoForm.valid && this.userInfoForm.value.email) {
      const paramObject: UserInfoType = {
        email: this.userInfoForm.value.email,
        deliveryType: this.deliveryType(),
        paymentType: this.userInfoForm.value.paymentType,
      };
      if (this.userInfoForm.value.firstName) {
        paramObject.firstName = this.userInfoForm.value.firstName;
      }
      if (this.userInfoForm.value.lastName) {
        paramObject.lastName = this.userInfoForm.value.lastName;
      }
      if (this.userInfoForm.value.fatherName) {
        paramObject.fatherName = this.userInfoForm.value.fatherName;
      }
      if (this.userInfoForm.value.phone) {
        paramObject.phone = this.userInfoForm.value.phone;
      }
      if (this.userInfoForm.value.street) {
        paramObject.street = this.userInfoForm.value.street;
      }
      if (this.userInfoForm.value.house) {
        paramObject.house = this.userInfoForm.value.house;
      }
      if (this.userInfoForm.value.entrance) {
        paramObject.entrance = this.userInfoForm.value.entrance;
      }
      if (this.userInfoForm.value.apartment) {
        paramObject.apartment = this.userInfoForm.value.apartment;
      }

      this.userServices.updateUserInfo(paramObject).subscribe({
        next: (data: DefaultResponseType) => {
          if (data.error) {
            this._snackbar.open(data.message, '', {
              duration: 3000,
            });
            throw new Error(data.message);
          }
          this._snackbar.open('Данные успешно сохранены', '', {
            duration: 3000,
          });
          this.userInfoForm.markAsPristine();
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.mesasage) {
            this._snackbar.open(errorResponse.error.mesasage, '', {
              duration: 3000,
            });
          } else {
            this._snackbar.open('Ошибка сохранения', '', {
              duration: 3000,
            });
          }
        },
      });
    }
  }
  isButtonDisabled(): boolean {
    return !this.userInfoForm.valid && !this.userInfoForm.dirty;
  }
}
