<script>
    import PageHeader from "$lib/components/PageHeader.svelte";
    import CustomModal from "$lib/components/CustomModal.svelte";
    import {
        formatTime,
        formatPhoneNum,
        generateRandomNumber,
        isAlphanumeric,
        removeSpecialCharactersAndSpaces,
    } from "$lib/lib.js";

    import uploadImageAct from "$lib/lib.js";
    import { onMount, tick } from "svelte";
    import axios from "axios";

    import { toastStore } from "$lib/stores/stores.js";
    import { back_api, public_img_bucket } from "$lib/const.js";
    import { invalidateAll } from "$app/navigation";

    let userInfo = $state({});
    let { data } = $props();

    // 닉네임 변경 area 부분 바꾸기
    let nickname = $state("");

    let nickChangeBool = $state(false); // 변경 창 열기!!
    let nickChangeInput; // focus를 위해

    // 휴대폰 변경 부분
    let phoneChangeBool = $state(false); // 변경 창 열기!!
    let phoneChangeInput; // focus를 위해

    let phone = $state("");

    let authNumber = $state(""); // 발송되는 인증번호

    let authNumChk = $state(""); // 실제 입력되는 인증번호
    let authShowBool = $state(false); // 인증번호 발송 시작되면 하단 인증 창 보여주기 위한 변수
    let timeLeft = $state(180); // 인증번호 카운트 다운 떨어지는 숫자!
    let ahthInterval = $state(null); // 인증번호 카운트 다운 시 setInerval 셋팅 변수

    // 비밀번호 변경 부분
    let prevPassword = $state("");
    let password = $state("");
    let pwdChangeBool = $state(false); //

    let alertModal = $state(false);
    let alertMessage = $state("");

    let profile = $state("");
    let profileStatus = $state(false);

    onMount(() => {
        clearInterval(ahthInterval);
        userInfo = data.userInfo;
        nickname = userInfo.nickname;
        phone = userInfo.phone;
        profile = userInfo.profile_image;
    });

    $effect(() => {
        if (data) {
            userInfo = data.userInfo;
        }
    });

    async function changeProfile() {
        uploadImageAct(
            `${back_api}/img/upload_single`,
            { folder: "profile" },
            (err, imgData) => {
                if (err) {
                    alert("이미지 업로드 실패! 다시 시도해주세요!");
                }
                profile = imgData.saveUrl;
                profileStatus = true;
            },
        );
    }

    async function updateProfile() {
        try {
            const res = await axios.post(`${back_api}/update_profile`, {
                type: this.value,
                profile,
                idx: userInfo.idx,
            });

            invalidateAll();
            profileStatus = false;

            if (this.value == "delete") {
                profile = res.data.profile;
            }
        } catch (error) {}
    }

    // 전화번호 인증 시작~~~~
    async function startAuth() {
        if (phone.length < 11) {
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
                            ahthInterval = null;
                            timeLeft = 180;
                            alertMessage =
                                "시간이 만료 되었습니다. 다시 시도해주세요.";
                            alertModal = true;
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
    async function chkAuthAndPhoneUpdate() {
        if (authNumber == authNumChk) {
            clearInterval(ahthInterval);

            const changePhone = removeSpecialCharactersAndSpaces(phone);
            try {
                const res = await axios.post(`${back_api}/update_user_info`, {
                    idx: userInfo.idx,
                    phone: changePhone,
                    type: "phone",
                });

                toastStore.set({
                    show: true,
                    message: "휴대폰 번호가 변경 되었습니다.",
                    color: "#4374D9",
                });

                ahthInterval = null;
                authShowBool = false;
                phoneChangeBool = false;
                invalidateAll();
            } catch (error) {
                alertMessage = "에러 발생! 관리자에게 문의 주세요!";
                alertModal = true;
            }
        } else {
            alertMessage = "인증번호가 일치하지 않습니다.";
            alertModal = true;

            return false;
        }
    }

    // ID / 닉네임 / 휴대폰번호 input 창에서 벗어날시 기존 DB와 중복 체크 부분!
    async function duplicate_chk(e) {
        const type = e.target.getAttribute("data-type");
        if (type == "nickname") {
            if (nickname) {
                try {
                    const res = await axios.post(`/auth/duplicate_chk`, {
                        type,
                        value: nickname,
                    });
                    return true;
                } catch (error) {
                    alertMessage = "중복된 닉네임 입니다. 다시 입력 해주세요.";
                    alertModal = true;
                    return false;
                }
            } else {
                alertMessage = "닉네임을 입력해 주세요.";
                alertModal = true;
                return false;
            }
        } else {
            if (phone) {
                try {
                    const res = await axios.post(`/auth/duplicate_chk`, {
                        type,
                        value: removeSpecialCharactersAndSpaces(phone),
                    });
                    clearInterval(ahthInterval);
                    return true;
                } catch (err) {
                    console.error(err.message);
                    alertMessage = "전화번호가 중복됩니다. 다시 입력해주세요";
                    alertModal = true;
                    return false;
                }
            } else {
                alertMessage = "전화번호를 입력해주세요";
                alertModal = true;
                return false;
            }
        }
    }

    async function updateNickname(e) {
        const type = e.target.dataset.type;
        if (type == "nickname") {
            try {
                const res = await axios.post(`${back_api}/update_user_info`, {
                    idx: userInfo.idx,
                    nickname,
                    type,
                });

                toastStore.set({
                    show: true,
                    message: "닉네임이 변경 되었습니다.",
                    color: "#4374D9",
                });

                invalidateAll();
                nickChangeBool = false;
            } catch (error) {
                toastStore.set({
                    show: true,
                    message: "에러 발생! 관리자에게 문의 해주세요.",
                    color: "#FF4848",
                });
            }
        }
    }

    async function changePasswordFunc() {
        if (!prevPassword) {
            alertModal = true;
            alertMessage = "기존 비밀번호를 입력해주세요.";
            return;
        }

        if (!password) {
            alertModal = true;
            alertMessage = "새로운 비밀번호를 입력해주세요.";
            return;
        }

        try {
            const res = await axios.post(`${back_api}/update_password`, {
                idx: userInfo.idx,
                prevPassword,
                password,
            });

            toastStore.set({
                show: true,
                message: "비밀번호가 변경 되었습니다.",
                color: "#4374D9",
            });

            invalidateAll();
            pwdChangeBool = false;
        } catch (err) {
            const m = err.response.data.message;
            alertModal = true;
            alertMessage = m;
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

<CustomModal bind:visible={alertModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-2">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div>{alertMessage}</div>
    </div>
</CustomModal>

<PageHeader></PageHeader>

<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="bg-white relative min-h-screen suit-font">
    <div class="max-w-[530px] mx-auto pt-14 pb-24">
        <div class="wrapper">
            <div class="w-20 h-20 relative mx-auto">
                <button
                    class="absolute -bottom-2.5 -right-2.5 w-7 h-7 border-2 rounded-full bg-white text-xs text-gray-500"
                    on:click={changeProfile}
                >
                    <i class="fa fa-camera" aria-hidden="true"></i>
                </button>

                <div
                    class="w-20 h-20 border-2 border-gray-300 rounded-xl overflow-hidden flex justify-center items-center"
                >
                    {#if profile}
                        <img
                            src="{public_img_bucket}{profile}"
                            alt=""
                            class="w-full h-full"
                        />
                    {:else}
                        <img
                            src="/profile-base.png"
                            alt=""
                            class="w-full h-full"
                        />
                    {/if}
                </div>
            </div>

            {#if profileStatus}
                <div class="mt-4 text-center">
                    <button
                        class="btn btn-warning btn-sm"
                        value="update"
                        on:click={updateProfile}
                    >
                        변경
                    </button>
                    <button
                        class="btn btn-error btn-sm"
                        value="delete"
                        on:click={updateProfile}
                    >
                        취소
                    </button>
                </div>
            {:else}
                <div class="mt-4 text-center">
                    <button
                        class="btn btn-accent btn-sm text-white block mx-auto"
                        on:click={changeProfile}
                    >
                        프로필 이미지 변경
                    </button>
                    <div class="text-xs mt-3">
                        프로필 이미지는 300 X 300 이내 정사각형 사이즈로
                        넣어주세요
                    </div>
                </div>
            {/if}

            <div class="w-[80%] mx-auto mt-5">
                <div class="pb-4.5 mb-4.5 border-b border-gray-200">
                    <div class="text-sm text-gray-500 mb-1.5">- 아이디</div>
                    <!-- <div class="ml-3">changyong112</div> -->
                    <div class="ml-3 flex justify-start items-center">
                        {#if userInfo.sns_id}
                            <span>SNS 로그인</span>
                            <span
                                class="text-xs px-2.5 py-0.5 bg-yellow-400 ml-5 rounded-md"
                            >
                                <i class="fa fa-comment" aria-hidden="true"></i>
                                KAKAO
                            </span>
                        {:else}
                            <span>{userInfo.id}</span>
                        {/if}
                    </div>
                </div>

                <div class="pb-4.5 mb-4.5 border-b border-gray-200">
                    <div class="text-sm text-gray-500 mb-1.5">- 이름</div>
                    <div class="ml-3">{userInfo.name}</div>
                </div>

                <div class="pb-4.5 mb-4.5 border-b border-gray-200">
                    <div class="text-sm text-gray-500 mb-1">- 닉네임</div>
                    <div class="ml-3 flex justify-between items-center">
                        <input
                            type="text"
                            class="border py-1 px-3 text-sm rounded-md border-gray-400 focus:outline-none focus:border-blue-400"
                            class:hidden={!nickChangeBool}
                            bind:this={nickChangeInput}
                            bind:value={nickname}
                        />
                        <span class="mt-1" class:hidden={nickChangeBool}>
                            {userInfo.nickname}
                        </span>

                        <div>
                            <button
                                class="btn btn-success btn-sm text-white"
                                on:click={() => {
                                    nickChangeBool = !nickChangeBool;
                                    if (nickChangeBool) {
                                        setTimeout(() => {
                                            nickChangeInput.focus();
                                        }, 10);
                                    }
                                }}
                            >
                                {#if nickChangeBool}
                                    취소
                                {:else}
                                    변경하기
                                {/if}
                            </button>

                            {#if nickChangeBool}
                                <button
                                    class="btn btn-info btn-sm text-white"
                                    data-type="nickname"
                                    on:click={async (e) => {
                                        const nickBool = await duplicate_chk(e);
                                        if (nickBool) {
                                            updateNickname(e);
                                        } else {
                                        }
                                    }}
                                >
                                    변경
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="pb-4.5 mb-4.5 border-b border-gray-200">
                    <div class="text-sm text-gray-500 mb-1">- 휴대폰</div>
                    <div class="ml-3 flex justify-between items-center">
                        <input
                            type="text"
                            class="border py-1 px-3 text-sm rounded-md border-gray-400 focus:outline-none focus:border-blue-400"
                            class:hidden={!phoneChangeBool}
                            bind:this={phoneChangeInput}
                            bind:value={phone}
                            on:input={formatPhoneNumber}
                        />

                        <span class="mt-1" class:hidden={phoneChangeBool}>
                            {#if userInfo.phone}
                                {formatPhoneNum(userInfo.phone)}
                            {/if}
                        </span>

                        <div>
                            {#if phoneChangeBool}
                                <button
                                    class="btn btn-info btn-sm text-white"
                                    data-type="phone"
                                    disabled={authShowBool}
                                    on:click={async (e) => {
                                        const phoneBool =
                                            await duplicate_chk(e);

                                        if (phoneBool) {
                                            startAuth();
                                        }
                                    }}
                                >
                                    인증
                                </button>
                            {/if}

                            <button
                                class="btn btn-success btn-sm text-white"
                                disabled={authShowBool}
                                on:click={() => {
                                    phoneChangeBool = !phoneChangeBool;
                                    phone = formatPhoneNum(userInfo.phone);
                                    if (phoneChangeBool) {
                                        setTimeout(() => {
                                            phoneChangeInput.focus();
                                        }, 10);
                                    }
                                }}
                            >
                                {#if !phoneChangeBool}
                                    변경하기
                                {:else}
                                    취소
                                {/if}
                            </button>
                        </div>
                    </div>

                    {#if authShowBool}
                        <div
                            class="ml-3 mt-2 flex justify-between items-center"
                        >
                            <input
                                type="text"
                                class="border py-1 px-3 text-sm rounded-md border-gray-400 focus:outline-none focus:border-blue-400"
                                bind:value={authNumChk}
                            />

                            <div>
                                <span
                                    class="mr-3 text-sm font-light"
                                    style="color: #DB3A00;"
                                    >{formatTime(timeLeft)}</span
                                >
                                <button
                                    class="btn btn-info btn-sm text-white"
                                    data-type="phone"
                                    on:click={chkAuthAndPhoneUpdate}
                                >
                                    변경
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if userInfo.sns_id}
                    &nbsp;
                {:else}
                    <div class="pb-4.5 mb-4.5 border-b border-gray-200">
                        <div class="text-sm text-gray-500 mb-3">- 비밀번호</div>

                        {#if !pwdChangeBool}
                            <div class="ml-3 flex justify-between items-center">
                                <span class="mt-1">***********</span>
                                <button
                                    class="btn btn-success btn-sm text-white"
                                    on:click={() => {
                                        pwdChangeBool = !pwdChangeBool;
                                    }}
                                >
                                    변경하기
                                </button>
                            </div>
                        {:else}
                            <div
                                class="ml-3 mb-1 flex justify-between items-center"
                            >
                                <input
                                    type="text"
                                    class="border py-1 px-3 text-sm rounded-md border-gray-400 focus:outline-none focus:border-blue-400"
                                    placeholder="기존 비밀번호"
                                    bind:value={prevPassword}
                                />
                            </div>
                            <div class="ml-3 flex justify-between items-center">
                                <input
                                    type="text"
                                    class="border py-1 px-3 text-sm rounded-md border-gray-400 focus:outline-none focus:border-blue-400"
                                    placeholder="새로운 비밀번호"
                                    bind:value={password}
                                />

                                <div>
                                    <button
                                        class="btn btn-success btn-sm text-white"
                                        on:click={changePasswordFunc}
                                    >
                                        변경
                                    </button>
                                    <button
                                        class="btn btn-info btn-sm text-white"
                                        on:click={() => {
                                            pwdChangeBool = !pwdChangeBool;
                                        }}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- <div class=" text-center">
                <button class="btn btn-info w-[50%] text-white">
                    변경하기
                </button>
            </div> -->
        </div>
    </div>
</div>
