import { OrdersStatusType } from '../../../types/orders-status.type';

export class OrdersStatusUtil {
  static getStatusAndColor(status: OrdersStatusType | undefined | null): {
    name: string;
    color: string;
  } {
    let name = 'Новый';
    let color = '#456F49';

    switch (status) {
      case OrdersStatusType.delivery:
        name = 'Доставка';
        break;
      case OrdersStatusType.cancelled:
        name = 'Отменен';
        color = '#FF7575';
        break;
      case OrdersStatusType.pending:
        name = 'Обработка';
        break;
      case OrdersStatusType.success:
        name = 'Выполнен';
        color = '#B6D5B9';
        break;
    }
    return { name, color };
  }
}
