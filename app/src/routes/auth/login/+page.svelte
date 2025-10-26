<script>
    import { goto } from "$app/navigation";
    import { user_info } from "$lib/stores/stores";
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { page } from "$app/stores";
    import { onMount, tick } from "svelte";
    import axios from "axios";
    import { back_api } from "$lib/const";
    import { TokenManager } from "$lib/token_manager";
    import { loginWithKakao } from "$lib/auth/kakao";

    import { SsgoiTransition } from "@ssgoi/svelte";

    let id = $state("");
    let password = $state("");

    // 모달 관련
    let successModal = $state(false);
    let successMessage = $state("");
    let alertModal = $state(false);
    let alertMessage = $state("");
    let modalLoading = $state(false);

    onMount(async () => {
        if ($user_info.idx) {
            alertMessage = "이미 로그인 되어 있습니다.";
            alertModal = true;
            setTimeout(() => {
                alertModal = false;
                location.href = "/";
            }, 800);
        }
    });

    $effect(() => {});

    async function loginSubmit(e) {
        e.preventDefault();
        const movePath = $page.url.searchParams.get("path");

        let errorMessage = "";
        let userInfo = {};
        try {
            const getUserRes = await axios.post(`${back_api}/auth/app_login`, {
                id,
                password,
            });

            userInfo = getUserRes.data.userInfo;

            const tokens = new TokenManager();

            await tokens.setToken(
                "refresh_token",
                getUserRes.data.refreshToken,
                Date.now() + 1000 * 60 * 60 * 24 * 14,
            );
            await tokens.setToken(
                "access_token",
                getUserRes.data.accessToken,
                Date.now() + 1000 * 5,
            );

            successMessage = "로그인 완료! 잠시후 메인으로 이동합니다.";
            successModal = true;
            modalLoading = true;
            const random = Math.floor(Math.random() * (1200 - 800 + 1)) + 800;
            setTimeout(() => {
                successModal = false;
                modalLoading = false;
                if (movePath) {
                    goto(movePath);
                } else {
                    goto("/", { invalidateAll: true });
                }
            }, random);
        } catch (err) {
            try {
                const m = err.response.data.message;

                alertModal = true;
                alertMessage = `${m ? m : ""} 다시 시도해주세요.`;
            } catch (error) {
                console.error(error.message);
            }
        }
    }

    async function kakao_login() {
        try {
            const kakaoData = await loginWithKakao();

            if (kakaoData.loginStatus) {
                successMessage = "메인으로 이동중입니다.";
                successModal = true;
                modalLoading = true;
                setTimeout(() => {
                    successModal = false;
                    modalLoading = false;
                    location.href = "/";
                }, 1500);
            } else {
                goto("/auth/kakao", {
                    state: {
                        data: kakaoData,
                    },
                });
            }
        } catch (err) {
            const m = err.response.data.message;
            alertModal = true;
            alertMessage = `${m ? m : ""} 다시 시도해주세요.`;
        }
    }
    // const kakao_login = () => {
    //     const kakaoInfo = {
    //         // kakao_restapi: "e6c8c90ba06c8dcbe1825e0785679d30",
    //         kakao_restapi: import.meta.env.VITE_KAKAO_RESTAPI,
    //         kakao_redirect: import.meta.env.VITE_KAKAO_REDIRECT_URI,
    //     };
    //     location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoInfo.kakao_restapi}&redirect_uri=${kakaoInfo.kakao_redirect}&response_type=code`;
    // };
</script>

<CustomModal bind:visible={successModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-green-700 text-3xl mb-2">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div>{successMessage}</div>
        {#if modalLoading}
            <div class="mt-2">
                <span class="loading loading-ring loading-xl"></span>
            </div>
        {/if}
    </div>
</CustomModal>

<CustomModal bind:visible={alertModal} closeBtn={true}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-2">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div>{alertMessage}</div>
        {#if modalLoading}
            <div class="mt-2">
                <span class="loading loading-ring loading-xl"></span>
            </div>
        {/if}
    </div>
</CustomModal>

<SsgoiTransition id="/auth/login">
    <!-- svelte-ignore event_directive_deprecated -->
    <div class="bg-green-50 relative min-h-screen suit-font">
        <div
            class="max-w-[530px] mx-auto pt-12 pb-10 bg-white p-14 min-h-screen"
        >
            <div class="text-center bg-white">
                <a href="/">
                    <img
                        src="/logo.png"
                        alt=""
                        class=" max-w-[150px] mx-auto"
                    />
                </a>
            </div>

            <div class="mt-12">
                <form on:submit={loginSubmit}>
                    <label class="input input-info mt-5 w-full bg-white">
                        <span class="min-w-4 flex justify-center">
                            <i
                                class="fa fa-id-card-o opacity-70"
                                aria-hidden="true"
                            ></i>
                        </span>

                        <input
                            type="text"
                            class="grow"
                            placeholder="아이디를 입력하세요"
                            bind:value={id}
                        />
                    </label>

                    <label class="input input-info mt-5 w-full bg-white">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            class="h-4 w-4 opacity-70"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <input
                            type="password"
                            class="grow"
                            placeholder="비밀번호를 입력하세요"
                            bind:value={password}
                        />
                    </label>

                    <div class="mt-5">
                        <button class="btn btn-info w-full text-white">
                            로그인하기
                        </button>
                    </div>
                </form>

                <div class="mt-3">
                    <button
                        class=" bg-[#ffe500] font-semibold w-full p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer"
                        on:click={kakao_login}
                    >
                        <img
                            src="/kakao_logo.png"
                            alt=""
                            width="24"
                            height="24"
                        />
                        카카오 간편 로그인
                    </button>
                </div>

                <div class="mt-3 text-center">
                    <button
                        class="btn btn-success text-white w-full"
                        on:click={() => {
                            goto("/auth/join");
                        }}
                    >
                        회원이 아니신가요? 회원가입 바로가기
                    </button>
                </div>
            </div>
        </div>
    </div>
</SsgoiTransition>
