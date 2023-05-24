import { transition, trigger, style, animate } from '@angular/animations';

export class AutomaticAnimation {
	public static SLIDE_TO_LEFT_ANIMATION_DURATION_IS_MS = 300;
	public static SLIDE_IN_OUT_ANIMATION_DURATION_IS_MS = 300;

	public static get slideToLeft() {
		return trigger('slideToLeft', [
			transition(
				':enter',
				[
					style({
						transform: 'translateX(100vw)',
					}),
					animate(
						`${AutomaticAnimation.SLIDE_TO_LEFT_ANIMATION_DURATION_IS_MS}ms {{delay}}ms ease-in-out`,
						style({
							transform: 'translateX(0)',
						}),
					),
				],
				{
					params: {
						delay: 0,
					},
				},
			),
		]);
	}

	public static get slideInOut() {
		return trigger('slideInOut', [
			transition(':enter', [
				style({
					transform: 'translateX(100vw)',
				}),
				animate(
					`${AutomaticAnimation.SLIDE_IN_OUT_ANIMATION_DURATION_IS_MS}ms ease-in`,
					style({
						transform: 'translateX(0)',
					}),
				),
			]),
			transition(':leave', [
				style({
					transform: 'translateX(0)',
				}),
				animate(
					`${AutomaticAnimation.SLIDE_IN_OUT_ANIMATION_DURATION_IS_MS}ms ease-out`,
					style({
						transform: 'translateX(100vw)',
					}),
				),
			]),
		]);
	}
}
