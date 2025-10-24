<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { goto } from "$app/navigation";
    import { back_api } from "$lib/const";
    import { user_info, joinStatus } from "$lib/stores/stores";

    import {
        formatTime,
        generateRandomNumber,
        isAlphanumeric,
        removeSpecialCharactersAndSpaces,
    } from "$lib/lib";

    import QuestionItem from "$lib/components/QuestionItem.svelte";
    import axios from "axios";
    import { onMount } from "svelte";

    onMount(() => {
        if ($user_info["idx"]) {
            alertMessage = "이미 로그인 되어 있습니다.";
            alertModal = true;
            modalLoading = true;
            setTimeout(() => {
                alertModal = false;
                modalLoading = false;
                location.href = "/";
            }, 800);
        }
    });
    let id = $state("");
    let idErrBool = $state(false); // 아이디 창 벗어났을때 에러 창 뜨게 하는 변수
    let idSuccessBool = $state(false); // 아이디 창 벗어났을때 성공 창 뜨게 하는 변수
    let idStatusErrBool = $state(false); // 아이디 형태가 이상할때 보여지는 변수

    let name = $state("");

    let nickname = $state("");
    let nicknameSuccessBool = $state(false); // 아이디 창 벗어났을때 성공 창 뜨게 하는 변수
    let nicknameErrBool = $state(false); // 아이디 창 벗어났을때 에러 창 뜨게 하는 변수

    let phone = $state("");

    let authNumber = $state(""); // 발송되는 인증번호

    let authNumChk = $state(""); // 실제 입력되는 인증번호
    let authShowBool = $state(false); // 인증번호 발송 시작되면 하단 인증 창 보여주기 위한 변수
    let authBool = $state(false); // 마무리 체크 단계 false 면 회원가입 안됨!
    let timeLeft = $state(180); // 인증번호 카운트 다운 떨어지는 숫자!
    let interval = $state(null); // 인증번호 카운트 다운 시 setInerval 셋팅 변수

    let businessNum = $state("");

    let password = $state("");
    let passwordChk = $state("");
    let pwdErrShowBool = $state(false); // 비밀번호가 일치하지 않을시 에러 창 뜨게!
    let pwdSuccessShowBool = $state(false); // 비밀번호가 일치하면 정상 창 뜨게!

    let alertModal = $state(false);
    let alertMessage = $state("");
    let successModal = $state(false); // 무언가 성공시 모달! (2초 후 로그인 페이지로 이동)
    let successMessage = $state("");
    let modalLoading = $state(false);

    // ID / 닉네임 / 휴대폰번호 input 창에서 벗어날시 기존 DB와 중복 체크 부분!
    async function duplicate_chk(e) {
        const type = e.target.getAttribute("data-type");
        if (type == "id") {
            const idChk = isAlphanumeric(id);
            if (!idChk) {
                idStatusErrBool = true;
            } else {
                idStatusErrBool = false;
            }

            if (id) {
                try {
                    const res = await axios.post(
                        `${back_api}/auth/duplicate_chk`,
                        {
                            type,
                            value: id,
                        },
                    );

                    idErrBool = false;
                    idSuccessBool = true;
                } catch (error) {
                    idErrBool = true;
                    idSuccessBool = false;
                }
            }
        } else if (type == "nickname") {
            if (nickname) {
                try {
                    const res = await axios.post(
                        `${back_api}/auth/duplicate_chk`,
                        {
                            type,
                            value: nickname,
                        },
                    );
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
                    const res = await axios.post(
                        `${back_api}/auth/duplicate_chk`,
                        {
                            type,
                            value: removeSpecialCharactersAndSpaces(phone),
                        },
                    );
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

    // 전화번호 인증 시작~~~~
    async function startAuth() {
        if (phone.length < 12) {
            alertMessage = "휴대폰 번호를 확인해주세요";
            alertModal = true;
            return;
        }
        authShowBool = true;
        authNumber = generateRandomNumber();
        console.log(authNumber);

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
            //         if (timeLeft > 0) {
            //             timeLeft -= 1;
            //         } else {
            //             authNumber = "";
            //             authShowBool = false;
            //             clearInterval(interval);
            //             interval = null;
            //             timeLeft = 180;
            //             alertMessage =
            //                 "시간이 만료 되었습니다. 다시 시도해주세요.";
            //             alertModal = true;
            //         }
            //     }, 1000);
            // }
        } catch (error) {}
    }

    // 인증 완료 또는 실패시
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

    // 비밀번호 와 비밀번호 확인 일치 여부!
    function chkPwdFunc() {
        pwdErrShowBool = false;
        pwdSuccessShowBool = false;
        if (password != "" && passwordChk != "" && password == passwordChk) {
            pwdSuccessShowBool = true;
        } else if (
            password != "" &&
            passwordChk != "" &&
            password != passwordChk
        ) {
            pwdErrShowBool = true;
        }
    }

    // 최종 회원가입!!
    async function joinSubmit(e) {
        e.preventDefault();
        if (!id) {
            alertMessage = "아이디를 입력하세요";
            alertModal = true;
            return;
        }
        if (idStatusErrBool == true) {
            alertMessage = "아이디 형식을 확인 해주세요";
            alertModal = true;
            return;
        }
        if (idErrBool == true) {
            alertMessage = "중복된 아이디입니다.";
            alertModal = true;
            return;
        }
        if (!name) {
            alertMessage = "이름을 입력하세요";
            alertModal = true;
            return;
        }

        if (nicknameErrBool == true) {
            alertMessage = "중복된 닉네임 입니다.";
            alertModal = true;
            return;
        }
        if (!nickname) {
            alertMessage = "닉네임을 입력하세요";
            alertModal = true;
            return;
        }
        if (!phone) {
            alertMessage = "휴대폰 번호를 입력하세요.";
            alertModal = true;
            return;
        }
        if (!authBool) {
            alertMessage = "휴대폰 인증을 완료해주세요";
            alertModal = true;
            return;
        }
        if (!password) {
            alertMessage = "비밀번호를 입력하세요";
            alertModal = true;
            return;
        }
        if (password != passwordChk) {
            alertMessage = "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
            alertModal = true;
            return;
        }

        phone = removeSpecialCharactersAndSpaces(phone);

        try {
            const res = await axios.post(`${back_api}/auth/join`, {
                id,
                name,
                nickname,
                phone,
                password,
            });

            joinStatus.set({
                type: "general",
                info: { id: id, password: password },
            });

            goto("/auth/interest_set");

            // successMessage = "회원가입 성공! 로그인 해주세요.";
            // successModal = true;
            // modalLoading = true;
            // setTimeout(() => {
            //     successModal = false;
            //     modalLoading = false;
            //     goto("/auth/login");
            // }, 1800);
        } catch (err) {
            console.error(err.message);
            alertMessage = "회원가입 실패 다시 시도해주세요";
            alertModal = true;
        }
    }

    // 전화번호 업로드시 숫자만 남기기
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

<div class="bg-green-50 relative min-h-screen suit-font">
    <div class="max-w-[530px] mx-auto pt-12 pb-10 bg-white p-14 min-h-screen">
        <div class="text-center bg-white">
            <a href="/">
                <img src="/logo.png" alt="" class=" max-w-[150px] mx-auto" />
            </a>

            <div class="mt-5 mb-1 text-2xl font-bold">회원가입</div>
        </div>

        <div class="">
            <!-- svelte-ignore event_directive_deprecated -->
            <form on:submit={joinSubmit}>
                <label class="input input-info mt-5 w-full bg-white">
                    <span class="min-w-4 flex justify-center">
                        <i class="fa fa-id-card-o opacity-70" aria-hidden="true"
                        ></i>
                    </span>

                    <!-- svelte-ignore event_directive_deprecated -->
                    <input
                        type="text"
                        class="grow"
                        placeholder="아이디를 입력하세요"
                        data-type="id"
                        bind:value={id}
                        on:focusin={() => {
                            idErrBool = false;
                            idSuccessBool = false;
                        }}
                        on:focusout={duplicate_chk}
                    />
                </label>
                {#if idStatusErrBool == true}
                    <div class="text-right text-xs text-red-500 mt-1">
                        아이디 형식이 잘못되었습니다. 영어 / 숫자만 사용
                        가능합니다.
                    </div>
                {:else if idErrBool == true}
                    <div class="text-right text-xs text-red-500 mt-1">
                        아이디가 중복됩니다. 다시 입력해주세요.
                    </div>
                {:else if idSuccessBool == true}
                    <div class="text-right text-xs text-green-600 mt-1">
                        사용 가능한 아이디 입니다.
                    </div>
                {/if}

                <label class="input input-info mt-5 w-full bg-white">
                    <span class="min-w-4 flex justify-center">
                        <i class="fa fa-user opacity-70" aria-hidden="true"></i>
                    </span>
                    <input
                        type="text"
                        class="grow"
                        placeholder="이름(실명)을 입력하세요"
                        bind:value={name}
                    />
                </label>

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
                {#if nicknameErrBool == true}
                    <div class="text-right text-xs text-red-500 mt-1">
                        닉네임이 중복됩니다. 다시 입력해주세요.
                    </div>
                {:else if nicknameSuccessBool == true}
                    <div class="text-right text-xs text-green-600 mt-1">
                        사용 가능한 닉네임 입니다.
                    </div>
                {/if}

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
                            bind:value={phone}
                            on:input={formatPhoneNumber}
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

                <label class="input input-info mt-5 w-full bg-white">
                    <span class="min-w-4 flex justify-center">
                        <i class="fa fa-user opacity-70" aria-hidden="true"></i>
                    </span>
                    <input
                        type="text"
                        class="grow"
                        placeholder="사업자 번호를 입력하세요"
                        bind:value={businessNum}
                    />
                </label>
                <div class="pl-1 text-xs mt-1 text-blue-500">
                    <p>(선택) 사업자 번호가 있으실 경우 입력 해 주세요.</p>
                </div>

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
                        on:focusout={chkPwdFunc}
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
                        placeholder="비밀번호 확인"
                        bind:value={passwordChk}
                        on:focusout={chkPwdFunc}
                    />
                </label>
                {#if pwdErrShowBool == true}
                    <div class="text-right text-xs text-red-500 mt-1">
                        비밀번호 확인이 일치하지 않습니다. 다시 시도해주세요
                    </div>
                {:else if pwdSuccessShowBool == true}
                    <div class="text-right text-xs text-green-600 mt-1">
                        비밀번호 확인이 일치합니다.
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

<style>
</style>
