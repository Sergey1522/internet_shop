import { OrderType } from './../../../../types/order.type ';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service ';
import { DefaultResponseType } from '../../../../types/default.response.type';
import { OrdersStatusUtil } from '../../../shared/utils/orders-status-util';

@Component({
  selector: 'app-orders',
  imports: [RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<OrderType[]>([]);
  ngOnInit(): void {
    this.orderService.getOrder().subscribe((data: OrderType[] | DefaultResponseType) => {
      if ((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.orders.set(
        (data as OrderType[]).map((item) => {
          const status = OrdersStatusUtil.getStatusAndColor(item.status);

          item.statusRus = status.name;
          item.color = status.color;

          return item;
        }),
      );
      console.log(data);
    });
  }
}
