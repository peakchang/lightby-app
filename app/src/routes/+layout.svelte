<script>
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";

	import { fly } from "svelte/transition";
	import { page } from "$app/stores";
	import { derived } from "svelte/store";
	import { onMount } from "svelte";
	import { afterNavigate, goto } from "$app/navigation";

	import Toast from "$lib/components/Toast.svelte";
	import Loading from "$lib/components/Loading.svelte";
	import CustomModal from "$lib/components/CustomModal.svelte";
	import PdButton from "$lib/components/PdButton.svelte";

	// 앱 관련
	import { Capacitor } from "@capacitor/core";
	import { StatusBar, Style } from "@capacitor/status-bar";
	import { App } from "@capacitor/app";
	import { TokenManager } from "$lib/token_manager";

	import { Ssgoi } from "@ssgoi/svelte";
	import { fade } from "@ssgoi/svelte/view-transitions";
	import { slide } from "@ssgoi/svelte/view-transitions";

	import {
		toastStore,
		viewLimitAlertModal,
		loadingStore,
		scrollY,
		pageScrollStatus,
		scrollVal,
	} from "$lib/stores/stores";

	let { children } = $props();

	let mainWrap = $derived({});

	// #main-wrap 에 전체 컨텐츠가 감싸져 있어 페이지 이동시 스크롤 값이 유지됨,
	// 아래 명령어도 페이지 이동시 스크롤 값 0으로 초기화!!
	afterNavigate(() => {
		mainWrap.scrollTop = 0;
	});

	// 현재 경로 감지용 key 생성
	const key = derived(page, ($page) => $page.url.pathname);

	// 현재 경로에 따라 애니메이션 사용할지 결정
	let useAnimation = $state(false);

	const animatedRoutes = ["simplewrite", "joboffer", "faq", "auth/manage"];

	const ssgoiConfig = {
		transitions: [
			{
				from: "/auth/login",
				to: "/auth/join",
				transition: fade(),
				symmetric: true, // 뒤로가기 시 자동으로 right
			},
			{
				from: "/auth/join",
				to: "/auth/interest_set",
				transition: slide({ direction: "left" }),
				symmetric: true,
			},
			{
				from: "/auth/interest_set",
				to: "/mytalent",
				transition: slide({ direction: "left" }),
				symmetric: true,
			},
		],
	};

	onMount(async () => {
		// -------------- 앱 관련
		if (Capacitor.getPlatform() === "android") {
			let lastBack = 0;
			App.addListener("backButton", ({ canGoBack }) => {
				// 모달/드로어 열림 상태면 여기서 닫기 처리 먼저 하세요 (필요 시)
				// if (modalOpen) { closeModal(); return; }

				if (canGoBack) {
					// 웹뷰 히스토리 뒤로
					window.history.back();
				} else {
					// 홈 화면 등 히스토리 없으면 "두 번 누르면 종료"
					const now = Date.now();
					if (now - lastBack < 1500) {
						App.exitApp();
					} else {
						lastBack = now;
						toastStore.set({
							show: true,
							message: "한번 더 누르시면 앱이 종료됩니다.",
							color: "#8C8C8C",
						});
					}
				}
			});
		}

		if (Capacitor.isNativePlatform()) {
			// ✅ 상태바 처리 (웹뷰와 겹치지 않게)
			await StatusBar.setOverlaysWebView({ overlay: false }); // WebView가 상태바 아래로
			// 선택: 스타일/색상
			await StatusBar.setStyle({ style: Style.Dark }); // 아이콘 어둡게(밝은 배경일 때)
			// Android 전용 배경색
			await StatusBar.setBackgroundColor({ color: "#ffffff" });

			// ===== 네비게이션 바 설정 (하단, Android만 해당) =====
			if (Capacitor.getPlatform() === "android") {
				// 네비게이션 바 배경색 설정
				await NavigationBar.setColor({ color: "#ffffff" });

				// 네비게이션 바 버튼 스타일 (어두운 아이콘)
				await NavigationBar.setButtonsColor({ color: "#000000" });
			}
		}
	});

	const unsubscribe = page.subscribe(($page) => {
		// useAnimation = animatedRoutes.includes($page.url.pathname);

		useAnimation = animatedRoutes.some((item) =>
			$page.url.pathname.includes(item),
		);
	});

	$effect(async () => {});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- Swiper JS -->
	<script
		src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
	></script>
	<!-- Link Swiper's CSS -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"
	/>
	<!-- SUIT 폰트 CSS -->
	<link
		href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css"
		rel="stylesheet"
	/>

	<link
		rel="stylesheet"
		as="style"
		href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard-dynamic-subset.css"
	/>

	<link
		rel="stylesheet"
		href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
	/>

	<!-- <script src="https://developers.kakao.com/sdk/js/kakao.js"></script> -->
</svelte:head>

<CustomModal bind:visible={$viewLimitAlertModal} closeBtn={false}>
	<div class="text-center">
		<div class=" text-green-700 text-3xl mb-2">
			<i class="fa fa-exclamation-circle" aria-hidden="true"></i>
		</div>
		<div class="mb-5">
			<p>게시물을 더 확인 하시려면 로그인이 필요합니다.</p>
			<p>로그인 하시겠습니까?</p>
		</div>
		<div class="flex justify-center gap-3">
			<!-- svelte-ignore event_directive_deprecated -->
			<button
				class="btn btn-info text-white w-1/3"
				on:click={() => {
					goto("/auth/login");
				}}
			>
				로그인 바로가기
			</button>

			<button class="btn btn-soft w-1/3">닫기</button>
		</div>
	</div>
</CustomModal>

<Loading />
<Toast />

<div id="app-safe-top"></div>
<div id="app">
	<div id="main-wrap" bind:this={mainWrap}>
		{#key key}
			{#if useAnimation}
				<div in:fly={{ y: 300, duration: 300 }}>
					{@render children()}
				</div>
			{:else}
				<Ssgoi config={ssgoiConfig}>
					<div>
						{@render children()}
					</div>
				</Ssgoi>
			{/if}
		{/key}
	</div>
</div>

<div id="app-safe-bottom"></div>

<style>
	:global(body) {
		user-select: none;
		-webkit-user-drag: none;
		-ms-overflow-style: none; /* IE, Edge */
		overflow-y: scroll; /* 스크롤 유지 */
	}

	:root {
		/* 기본 여백 */
		--safe-top: env(safe-area-inset-top);
		--safe-bottom: env(safe-area-inset-bottom);
	}

	#app-safe-top {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		min-height: var(--safe-top);
		background-color: red;
		z-index: 99999;
	}

	#app-safe-bottom {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		min-height: var(--safe-bottom);
		background-color: red;
		z-index: 99999;
	}

	#main-wrap {
		flex: 1;
		overflow-y: auto;
		padding: 10px 10px 0 10px;

		scrollbar-width: none; /* Firefox */
	}

	#main-wrap::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Edge */
	}

	#app {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		max-width: 1024px;
		margin: 0 auto;
		padding-top: var(--safe-top);
		padding-bottom: var(--safe-bottom);
	}

	.top-fix-test {
		position: fixed;
		top: var(--safe-top);
		left: 0;
		width: 100%;
		height: 30px;

		z-index: 50;
	}

	.top-fix-wrap {
		max-width: 1024px;
		margin: 0 auto;
		padding: 0 15px;
		background-color: aquamarine;
	}
</style>
