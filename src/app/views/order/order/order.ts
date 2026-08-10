import { OrderType } from './../../../../types/order.type ';
import { PaymentType } from './../../../../types/payment.type ';
import { TypeCart } from './../../../../types/cart.type';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ServiceCart } from '../../../shared/services/service.cart';
import { DeliveryType } from '../../../../types/delivery.type';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../shared/services/order.service ';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service ';
import { UserInfoType } from '../../../../types/user.info.type';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogModule],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  private dialog = inject(MatDialog);
  private cartServices = inject(ServiceCart);
  private orderServices = inject(OrderService);
  private userServices = inject(UserService);
  private authServices = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  dialogRef = signal<MatDialogRef<any> | null>(null);
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;
  orderForm: FormGroup = this.fb.group({
    deliveryType: [DeliveryType.delivery],
    lastName: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    fatherName: [''],
    phone: ['', [Validators.required, Validators.pattern(/^8\d{10}$/)]],
    paymentType: [PaymentType.cashToCourier, Validators.required],
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
  productCart = signal<TypeCart | null>(null);
  totalPrice = signal<number>(0);
  totalCount = signal<number>(0);
  deliveryPrice = signal<number>(10);
  summaryPrice = signal<number>(0);
  notDelivery = signal<boolean>(false);

  ngOnInit(): void {
    this.cartServices.getCart().subscribe((data: TypeCart) => {
      console.log(data);
      this.productCart.set(data);
      this.calculateTotal();
      this.updateDeliveryTypeValidation();
    });
    if (this.authServices.getIsLoggedIn()) {
      this.userServices.getUserInfo().subscribe((data: UserInfoType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        const userInfo = data as UserInfoType;
        console.log(userInfo);
        const paramToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          paymentType: userInfo.paymentType
            ? userInfo.paymentType
            : this.paymentTypes.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : '',
          comment: '',
        };
        this.orderForm.patchValue(paramToUpdate);
        if (userInfo.deliveryType) {
          this.deliveryType.set(userInfo.deliveryType);
        }
      });
    }
  }
  calculateTotal() {
    this.totalCount.set(0);
    this.totalPrice.set(0);
    if (this.productCart()) {
      this.productCart()?.items.forEach((item) => {
        this.totalPrice.set(this.totalPrice() + item.quantity * item.product.price);
        this.totalCount.set(this.totalCount() + item.quantity);
        this.summaryPrice.set(this.totalPrice() + this.deliveryPrice());
      });
    }
  }
  changeDeliveryType(type: DeliveryType): void {
    this.deliveryType.set(type);
    if (type == this.deliveryTypes.self) {
      this.notDelivery.set(true);
      this.deliveryPrice.set(0);
      this.calculateTotal();
      this.updateDeliveryTypeValidation();
    }
    if (type == this.deliveryTypes.delivery) {
      this.notDelivery.set(false);
      this.deliveryPrice.set(10);
      this.calculateTotal();
      this.updateDeliveryTypeValidation();
    }
  }
  createOrder() {
    if (
      this.orderForm.valid &&
      this.orderForm.value.firstName &&
      this.orderForm.value.lastName &&
      this.orderForm.value.phone &&
      this.orderForm.value.paymentType &&
      this.orderForm.value.email
    ) {
      this.orderForm.markAllAsTouched();
      const deliveryType = this.deliveryType();
      const paramsObject: OrderType = {
        deliveryType: deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone.trim(),
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email,
      };
      console.log(paramsObject);

      if (this.deliveryType() == DeliveryType.delivery) {
        if (this.orderForm.value.street) {
          paramsObject.street = this.orderForm.value.street;
        }
        if (this.orderForm.value.house) {
          paramsObject.house = this.orderForm.value.house;
        }
        if (this.orderForm.value.entrance) {
          paramsObject.entrance = this.orderForm.value.entrance;
        }
        if (this.orderForm.value.apartment) {
          paramsObject.apartment = this.orderForm.value.apartment;
        }
      }
      if (this.orderForm.value.comment) {
        paramsObject.comment = this.orderForm.value.comment;
      }
      console.log('📦 Отправка заказа:', JSON.stringify(paramsObject, null, 2));
      this.orderServices.createOrder(paramsObject).subscribe({
        next: (data: OrderType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            const error = (data as DefaultResponseType).message;

            throw new Error(error);
          }

          this.dialogRef.set(this.dialog.open(this.popup));
          this.dialogRef()
            ?.backdropClick()
            .subscribe(() => {
              this.router.navigate(['/']);
            });

          this.cartServices.count$.next(0);
        },
      });
    }
  }
  closeDialog(): void {
    this.dialogRef()?.close();
    this.router.navigate(['/']);
  }
  updateDeliveryTypeValidation() {
    if (this.deliveryType() === DeliveryType.delivery) {
      this.orderForm.get('street')?.setValidators(Validators.required);
      this.orderForm.get('house')?.setValidators(Validators.required);
    } else {
      this.orderForm.get('street')?.removeValidators(Validators.required);
      this.orderForm.get('house')?.removeValidators(Validators.required);
      this.orderForm.get('street')?.setValue('');
      this.orderForm.get('house')?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }
    this.orderForm.get('street')?.updateValueAndValidity();
    this.orderForm.get('house')?.updateValueAndValidity();
  }
}
