import { Observable } from 'rxjs';
import {
	ApiResponseWrapper,
	EventOrder,
	EventOrderCreatableParams,
	EventOrderEditableParams,
	EventOrderQueryableParams,
	QrCodeRseponse,
} from 'karikarihelper';

// Types
import { BaseApi } from '@types';

export class EventOrderRegistryApiV1 extends BaseApi {
	private _endpoint = `${this.root}/v1/admin/registry/event/order`;

	public status(): Observable<ApiResponseWrapper<string[]>> {
		const endpoint = new URL(this._endpoint + '/status');

		return this.client.get<ApiResponseWrapper<string[]>>(endpoint.href, {
			withCredentials: true,
		});
	}

	public getQRCode(orderId: string): Observable<ApiResponseWrapper<QrCodeRseponse>> {
		const endpoint = new URL(`${this._endpoint}/qr/${orderId}`);

		return this.client.get<ApiResponseWrapper<QrCodeRseponse>>(endpoint.href, {
			withCredentials: true,
		});
	}
}
