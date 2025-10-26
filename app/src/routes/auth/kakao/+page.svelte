<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { user_info, joinStatus } from "$lib/stores/stores";
    import { back_api } from "$lib/const";
    import {
        formatTime,
        generateRandomNumber,
        removeSpecialCharactersAndSpaces,
        fetchRequest,
    } from "$lib/lib";
    import axios from "axios";
    import { onMount } from "svelte";

    import { TokenManager } from "$lib/token_manager";

    let data = $state({});

    let userInfo = $state({});

    // 필수 정보 변수!
    let nickname = $state("");
    let phone = $state("");

    let nicknameSuccessBool = $state(false); // 아이디 창 벗어났을때 성공 창 뜨게 하는 변수
    let nicknameErrBool = $state(false); // 아이디 창 벗어났을때 에러 창 뜨게 하는 변수

    let authNumber = $state(""); // 발송되는 인증번호
    let authNumChk = $state(""); // 실제 입력되는 인증번호
    let authShowBool = $state(false); // 인증번호 발송 시작되면 하단 인증 창 보여주기 위한 변수
    let authBool = $state(false); // 마무리 체크 단계 false 면 회원가입 안됨!
    let timeLeft = $state(180); // 인증번호 카운트 다운 떨어지는 숫자!
    let interval = $state(null); // 인증번호 카운트 다운 시 setInerval 셋팅 변수

    let alertModal = $state(false);
    let alertMessage = $state("");
    let successModal = $state(false); // 무언가 성공시 모달! (2초 후 로그인 페이지로 이동)
    let successMessage = $state("");
    let modalLoading = $state(false);

    // 고객정보 대조 후 필수 정보 (전화번호 / 이름) 없으면 인증 받기 (SNS 아이디는 비밀번호 X)
    // 이렇게 해서 로그인 / 회원가입 같이 처리하기
    // 휴대폰 번호 등록은 아직이니까 추후 비즈니스 등록 후, 카카오에서 승낙하면 수정하기!

    /*
    1. 먼저 +page.server.js 에서 DB에 있는지 조회! (있으면 회원 정보 가지고 오기!)
    >> 만약 정보가 다 있으면 쿠키에 JWT 토큰 넣고 메인페이지로 이동 refresh! (hook 으로 처리)

    2. 필수 정보 없으면 정보 받기! (전화번호 / 이름)
    3. 필수 정보 다 채워지면 +server.js 를 통해 DB에 입력 / JWT 토큰 생성 및 쿠키 저장 / 메인페이지로 refresh! (hook 으로 처리)
    */

    onMount(() => {
        data = $page.state.data;

        userInfo = data.userInfo;

        if (data.loginStatus == undefined) {
            alertMessage = "오류입니다. 다시 시도해주세요";
            alertModal = true;
            modalLoading = true;
            setTimeout(() => {
                alertModal = false;
                modalLoading = false;
                goto("/auth/login");
            }, 1500);
        }
        // 빈 객체가 아닐경우 유저 정보가 있으므로 store userInfo 에 정보 넣고 메인 페이지로 이동!
        if (data.loginStatus == true) {
            successMessage = "메인으로 이동중입니다.";
            successModal = true;
            modalLoading = true;
            setTimeout(() => {
                successModal = false;
                modalLoading = false;
                location.href = "/";
            }, 1500);
        }

        if (userInfo.phone) {
            authBool = true;
        }
    });

    async function duplicate_chk(e) {
        const type = e.target.getAttribute("data-type");
        if (type == "nickname") {
            if (nickname) {
                try {
                    const res = await axios.post(`/auth/duplicate_chk`, {
                        type,
                        value: nickname,
                    });
                    nicknameErrBool = false;
                    nicknameSuccessBool = true;
                } catch (error) {
                    nicknameErrBool = true;
                    nicknameSuccessBool = false;
                }
            }
        } else {
            if (phone) {
                try {
                    const res = await axios.post(`/auth/duplicate_chk`, {
                        type,
                        value: removeSpecialCharactersAndSpaces(phone),
                    });
                    clearInterval(interval);
                    return true;
                } catch (error) {
                    alertMessage = "전화번호가 중복됩니다. 다시 입력해주세요";
                    alertModal = true;
                    phone = "";
                    return false;
                }
            } else {
                alertMessage = "전화번호를 입력해주세요";
                alertModal = true;
                return false;
            }
        }
    }

    async function snsloginSubmit(e) {
        e.preventDefault();

        if (!data.loginStatus && !userInfo.phone && !phone) {
            alertMessage = "휴대폰 번호를 입력하세요.";
            alertModal = true;
            return;
        }

        if (!data.loginStatus && !userInfo.phone && !authBool) {
            alertMessage = "휴대폰 인증을 완료해주세요";
            alertModal = true;
            return;
        }

        if (!data.loginStatus && !userInfo.nickname && !nickname) {
            alertMessage = "닉네임을 입력하세요";
            alertModal = true;
            return;
        }

        if (phone) {
            userInfo.phone = removeSpecialCharactersAndSpaces(phone);
        }
        if (nickname) {
            userInfo.nickname = nickname;
        }

        try {
            const res = await axios.post(`${back_api}/auth/kakao_join_app`, {
                userInfo,
            });

            console.log("카카오 콜백 정보!!");
            console.log(res);

            const tokens = new TokenManager();

            await tokens.setToken(
                "refresh_token",
                res.data.refreshToken,
                Date.now() + 1000 * 60 * 60 * 24 * 14,
            );
            await tokens.setToken(
                "access_token",
                res.data.accessToken,
                Date.now() + 1000 * 5,
            );

            $user_info["idx"] = res.data.userId;
            $user_info["rate"] = 1;

            // 카카오 로그인 시 user 의 idx 값을 보내기!!
            $joinStatus["type"] = "kakao";
            $joinStatus["idx"] = res.data.userId;

            goto("/auth/interest_set");

            // successMessage = "로그인 성공! 메인으로 이동합니다.";
            // successModal = true;
            // modalLoading = true;
            // setTimeout(() => {
            //     successModal = false;
            //     modalLoading = false;

            //     goto("/");
            // }, 1800);
        } catch (error) {
            // alertMessage = "회원가입 실패 다시 시도해주세요";
            alertMessage = error.message;
            alertModal = true;
        }
    }

    async function startAuth() {
        if (phone.length < 12) {
            alertMessage = "휴대폰 번호를 확인해주세요";
            alertModal = true;
            return;
        }
        authShowBool = true;
        authNumber = generateRandomNumber();

        try {
            const res = await axios.post(`${back_api}/send_sms`, {
                phone,
                message: `번개분양 인증번호 ${authNumber}`,
            });
            if (res.status == 200) {
                if (!interval) {
                    interval = setInterval(() => {
                        if (timeLeft > 0) {
                            timeLeft -= 1;
                        } else {
                            authNumber = "";
                            authShowBool = false;
                            clearInterval(interval);
                            interval = null;
                            timeLeft = 180;
                            alert("시간이 만료 되었습니다. 다시 시도해주세요.");
                        }
                    }, 1000);
                }
            }

            // if (!interval) {
            //     interval = setInterval(() => {
            //         console.log("반복 실행 중...");
            //         if (timeLeft > 0) {
            //             timeLeft -= 1;
            //         } else {
            //             authNumber = "";
            //             authShowBool = false;
            //             clearInterval(interval);
            //             interval = null;
            //             timeLeft = 180;
            //             alert("시간이 만료 되었습니다. 다시 시도해주세요.");
            //         }
            //     }, 1000);
            // }
        } catch (error) {}
    }

    function checkAuthStop() {
        if (authNumber == authNumChk) {
            clearInterval(interval);
            successMessage = "인증 되었습니다.";
            successModal = true;

            interval = null;
            authShowBool = false;
            authBool = true;
        } else {
            alertMessage = "인증번호가 일치하지 않습니다.";
            alertModal = true;

            return false;
        }
    }

    function formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, ""); // 숫자만 남기기 (한글, 영어, 특수문자 제거)

        if (value.length > 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d+)/, "$1-$2");
        } else if (value.length > 7) {
            value = value.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
        }

        phone = value;
    }
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

<CustomModal bind:visible={alertModal} closeBtn={false}>
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

<div class="bg-green-50 relative min-h-screen paperlogy">
    <div class="max-w-[530px] mx-auto pt-12 pb-10 bg-white p-14">
        <div class="text-center bg-white">
            <img src="/logo.png" alt="" class=" max-w-[150px] mx-auto" />
        </div>

        <div class="mt-12">
            <!-- svelte-ignore event_directive_deprecated -->
            <form on:submit={snsloginSubmit}>
                {#if !userInfo.nickname & !data.loginStatus}
                    <label class="input input-info mt-5 w-full bg-white">
                        <span class="min-w-4 flex justify-center">
                            <i
                                class="fa fa-user-circle opacity-70"
                                aria-hidden="true"
                            ></i>
                        </span>

                        <!-- svelte-ignore event_directive_deprecated -->
                        <input
                            type="text"
                            class="grow"
                            placeholder="활동하실 닉네임을 입력하세요"
                            data-type="nickname"
                            bind:value={nickname}
                            on:focusin={() => {
                                nicknameErrBool = false;
                                nicknameSuccessBool = false;
                            }}
                            on:focusout={duplicate_chk}
                        />
                    </label>
                {/if}

                {#if nicknameErrBool == true}
                    <div class="text-right text-xs text-red-500 mt-1">
                        닉네임이 중복됩니다. 다시 입력해주세요.
                    </div>
                {:else if nicknameSuccessBool == true}
                    <div class="text-right text-xs text-green-600 mt-1">
                        사용 가능한 닉네임 입니다.
                    </div>
                {/if}

                {#if !userInfo.phone & !data.loginStatus}
                    <div class="flex items-center mt-5 gap-2">
                        <label class="input input-info w-full bg-white">
                            <span class="min-w-4 flex justify-center">
                                <i
                                    class="fa fa-mobile text-lg opacity-70"
                                    aria-hidden="true"
                                ></i>
                            </span>

                            <input
                                type="text"
                                class="grow"
                                placeholder="휴대폰 번호를 입력하세요"
                                disabled={authShowBool || authBool}
                                on:input={formatPhoneNumber}
                                bind:value={phone}
                            />
                            <!-- disabled -->
                        </label>

                        <button
                            type="button"
                            data-type="phone"
                            class="btn btn-success text-white"
                            disabled={authShowBool || authBool}
                            on:click={async (e) => {
                                const phoneBool = await duplicate_chk(e);

                                if (phoneBool) {
                                    startAuth();
                                }
                            }}
                        >
                            인증받기
                        </button>
                    </div>
                {/if}

                {#if authShowBool}
                    <div class="flex items-center mt-1.5 gap-2">
                        <label class="input input-info w-full bg-white">
                            <span
                                class="min-w-4 flex justify-center text-red-400"
                            >
                                {formatTime(timeLeft)}
                            </span>

                            <input
                                type="text"
                                class="grow"
                                placeholder="인증번호를 입력하세요"
                                bind:value={authNumChk}
                            />
                        </label>

                        <button
                            type="button"
                            class="btn btn-warning text-white"
                            on:click={checkAuthStop}
                        >
                            인증확인
                        </button>
                    </div>
                {/if}

                {#if data.loginStatus != true}
                    <label class="input input-info mt-5 w-full bg-white">
                        <span class="min-w-4 flex justify-center">
                            <i class="fa fa-user opacity-70" aria-hidden="true"
                            ></i>
                        </span>
                        <input
                            type="text"
                            class="grow"
                            placeholder="사업자 번호를 입력하세요"
                        />
                    </label>
                    <div class="pl-1 text-xs mt-1 text-blue-500">
                        <p>(선택) 사업자 번호가 있으실 경우 입력 해 주세요.</p>
                    </div>
                {/if}

                <div class="mt-5">
                    <button class="btn btn-info btn-lg w-full text-white">
                        가입하기
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
