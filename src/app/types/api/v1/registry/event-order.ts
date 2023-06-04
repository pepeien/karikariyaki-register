import { Observable } from 'rxjs';
import {
	ApiResponseWrapper,
	EventOrder,
	EventOrderCreatableParams,
	EventOrderEditableParams,
	EventOrderQueryableParams,
} from 'karikarihelper';

// Types
import { BaseApi } from '@types';

export class EventOrderRegistryApiV1 extends BaseApi {
	private _endpoint = `${this.root}/v1/admin/registry/event/order`;

	public search(
		params?: EventOrderQueryableParams,
	): Observable<ApiResponseWrapper<EventOrder[]>> {
		const endpoint = new URL(this._endpoint);

		if (params?.id) {
			endpoint.searchParams.append('id', params.id.trim());
		}

		if (params?.eventId) {
			endpoint.searchParams.append('eventId', params.eventId.trim());
		}

		if (params?.status) {
			endpoint.searchParams.append('status', params.status.trim());
		}

		if (params?.operatorId) {
			endpoint.searchParams.append('operatorId', params.operatorId.trim());
		}

		if (params?.clientName) {
			endpoint.searchParams.append('clientName', params.clientName.trim());
		}

		return this.client.get<ApiResponseWrapper<EventOrder[]>>(endpoint.href, {
			withCredentials: true,
		});
	}

	public status(): Observable<ApiResponseWrapper<string[]>> {
		const endpoint = new URL(this._endpoint + '/status');

		return this.client.get<ApiResponseWrapper<string[]>>(endpoint.href, {
			withCredentials: true,
		});
	}

	public getQRCode(orderId: string): Observable<ApiResponseWrapper<string>> {
		const endpoint = new URL(`${this._endpoint}/qr/${orderId}`);

		return this.client.get<ApiResponseWrapper<string>>(endpoint.href, {
			withCredentials: true,
		});
	}

	public save(params: EventOrderCreatableParams): Observable<ApiResponseWrapper<EventOrder>> {
		const endpoint = new URL(this._endpoint);

		return this.client.post<ApiResponseWrapper<EventOrder>>(
			endpoint.href,
			{
				eventId: params.eventId,
				status: params.status,
				operatorId: params.operatorId,
				clientName: params.clientName,
				itemsId: params.itemsId,
			},
			{
				withCredentials: true,
			},
		);
	}

	public edit(
		id: string,
		params: EventOrderEditableParams,
	): Observable<ApiResponseWrapper<EventOrder>> {
		const endpoint = new URL(`${this._endpoint}/${id.trim()}`);

		return this.client.patch<ApiResponseWrapper<EventOrder>>(
			endpoint.href,
			{
				status: params.status,
			},
			{
				withCredentials: true,
			},
		);
	}

	public delete(id: string): Observable<ApiResponseWrapper<EventOrder>> {
		const endpoint = new URL(`${this._endpoint}/${id.trim()}`);

		return this.client.delete<ApiResponseWrapper<EventOrder>>(endpoint.href, {
			withCredentials: true,
		});
	}
}
