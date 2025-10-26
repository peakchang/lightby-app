<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import PageHeader from "$lib/components/PageHeader.svelte";
    import imageCompression from "browser-image-compression";

    import { onDestroy, onMount } from "svelte";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    import uploadImageAct from "$lib/lib.js";
    import { back_api, public_img_bucket } from "$lib/const.js";
    import {
        toastStore,
        scrollY,
        pageScrollStatus,
        loadingStore,
    } from "$lib/stores/stores";
    import { afterNavigate, goto } from "$app/navigation";
    import axios from "axios";

    import { SsgoiTransition } from "@ssgoi/svelte";

    let { data } = $props();

    console.log(data);

    let authBool = $state(false);

    let profile = $state("");
    let name = $state("");
    let gender = $state("남자");
    let age = $state("");

    let careerList = $state([]);
    let careerSplit = $state("");
    let career = $state("");

    let introduction = $state("");

    let profileStatus = $state(false);

    let compressedFile = $state({});
    let previewImg = $state("");

    let alertModal = $state(false);
    let alertMessage = $state("");
    let successModal = $state(false); // 무언가 성공시 모달! (2초 후 로그인 페이지로 이동)
    let successMessage = $state("");
    let modalLoading = $state(false);

    let skipModal = $state(false);

    afterNavigate((e) => {
        console.log(e);
        if (e.from && e.from.route.id.includes("auth")) {
            authBool = true;
        }
    });

    onMount(() => {
        if (!data.userInfo) {
            console.log("여기 와야지??");
            goto("/my");
        }

        $pageScrollStatus = false;

        if (data.userInfo.profile_image) {
            profile = data.userInfo.profile_image;
        }

        name = data.userInfo.name;
        age = data.userInfo.age;
        career = data.userInfo.career;
        if (career) {
            careerList = career.split("|");
        }

        introduction = data.userInfo.introduction;
    });

    function changeProfile() {
        const input = document.createElement("input");

        input.setAttribute("type", "file");
        input.setAttribute("accept", ".png,.jpg,.jpeg,.webp,.gif");
        input.click();

        input.onchange = async (e) => {
            loadingStore.set(true);

            const imageFile = e.target.files[0];

            const options = {
                maxSizeMB: 1, // 최대 파일 크기 (MB)
                // maxWidthOrHeight: 1024, // 최대 너비 또는 높이
                useWebWorker: true, // 웹 워커 사용
            };

            try {
                const maxSize = 1 * 1024 * 1024; // 1MB

                if (imageFile.name.split(".")[1] == "gif") {
                    if (imageFile.size >= maxSize) {
                        throw new Error("파일 용량이 1MB 이상입니다.");
                    }
                    compressedFile = imageFile;
                } else {
                    compressedFile = await imageCompression(imageFile, options);
                }

                const previewSrc = URL.createObjectURL(compressedFile);
                previewImg = previewSrc;

                loadingStore.set(false);
                if (typeof callback === "function") {
                    callback(null, res.data);
                }
            } catch (err) {
                console.error(err.message);

                loadingStore.set(true);
                const m = err.response?.data?.message;
                if (typeof callback === "function") {
                    callback(err, null);
                }
            }
        };
    }

    function deleteCareerList() {
        console.log(this.value);
        careerList.splice(Number(this.value), 1);
    }

    async function uploadMyTalent() {
        if (!name) {
            alertModal = true;
            alertMessage = "이름을 입력 해 주세요.";
            return;
        }

        if (!age) {
            alertModal = true;
            alertMessage = "나이를 입력 해 주세요.";
            return;
        }

        if (!introduction) {
            alertModal = true;
            alertMessage = "자기소개를 입력 해 주세요.";
            return;
        }

        career = careerList.join("|");

        if (Object.keys(compressedFile).length != 0) {
            let imgForm = new FormData();
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}${Math.random()
                .toString(36)
                .substring(2, 11)}.${compressedFile.name.split(".")[1]}`;
            imgForm.append("folder", "profile");
            imgForm.append("onimg", compressedFile, fileName);

            imgForm.append("name", name);
            imgForm.append("gender", gender);
            imgForm.append("age", age);
            imgForm.append("career", career);
            imgForm.append("introduction", introduction);
            imgForm.append("prev_img", profile);
            imgForm.append("idx", data.userInfo.idx);

            try {
                const res = await axios.post(
                    `${back_api}/adm_etc/upload_talent_include_image`,
                    imgForm,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    },
                );

                if (res.status) {
                    if (authBool) {
                        successMessage =
                            "회원가입 성공! 번개분양을 시작합니다!";
                        successModal = true;
                        modalLoading = true;
                        setTimeout(() => {
                            successModal = false;
                            modalLoading = false;
                            goto("/");
                        }, 1800);
                    } else {
                        successModal = true;
                        successMessage = "내 인재 정보가 업데이트 되었습니다.";
                    }
                }
            } catch (error) {}
        } else {
            try {
                const res = await axios.post(
                    `${back_api}/adm_etc/upload_talent_no_image`,
                    {
                        name,
                        gender,
                        age,
                        career,
                        introduction,
                        idx: data.userInfo.idx,
                    },
                );

                if (res.status) {
                    if (authBool) {
                        successMessage =
                            "회원가입 성공! 번개분양을 시작합니다!";
                        successModal = true;
                        modalLoading = true;
                        setTimeout(() => {
                            successModal = false;
                            modalLoading = false;
                            goto("/");
                        }, 1800);
                    } else {
                        successModal = true;
                        successMessage = "내 인재 정보가 업데이트 되었습니다.";
                    }
                }
            } catch (error) {}
            console.log("이미지 업로드 없음");
        }
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

<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={skipModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-green-700 text-3xl mb-2">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-8">
            내 인재 정보는 마이 > 내 인재 글 관리에서 언제든 수정 가능합니다.
        </div>

        <button
            class="btn btn-success w-1/3 text-white"
            on:click={() => {
                goto("/");
            }}
        >
            번개분양 시작하기
        </button>
    </div>
</CustomModal>

{#if !authBool}
    <PageHeader />
{/if}

<SsgoiTransition id="/mytalent">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <!-- svelte-ignore event_directive_deprecated -->
    <div class="bg-white relative min-h-screen">
        <div class="max-w-[530px] mx-auto suit-font pt-14 pb-24 px-4 md:px-0">
            <div class="text-center mb-10">
                <p>📝 프로필을 작성해 주세요.</p>
                <p>😄 시행사 · 대행사 · 본부장 · 팀장님께서 ⚡</p>
                <p>빠르게 연락드릴 수 있어요 🤝</p>
            </div>

            <div class="mb-6">
                <!-- 프로필 변경 영역 -->
                <div class="w-32 h-32 relative mx-auto">
                    <button
                        class="absolute -bottom-2.5 -right-2.5 w-7 h-7 border-2 rounded-full bg-white text-xs text-gray-500"
                        on:click={changeProfile}
                    >
                        <i class="fa fa-camera" aria-hidden="true"></i>
                    </button>

                    <div
                        class="w-32 h-32 border-2 border-gray-300 rounded-xl overflow-hidden flex justify-center items-center"
                    >
                        {#if previewImg}
                            <img
                                src={previewImg}
                                alt=""
                                class="w-full h-full"
                            />
                        {:else if profile}
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
            </div>

            <div class="mb-6">
                <div class="mb-1">이름</div>
                <div>
                    <input
                        type="text"
                        class="border w-2/3 py-2 px-3 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                        bind:value={name}
                    />
                </div>
            </div>

            <div class="mb-6">
                <div class="mb-1">성별</div>
                <div class="flex gap-2">
                    <label class="button-checkbox w-full">
                        <input
                            type="radio"
                            hidden
                            value="남자"
                            bind:group={gender}
                        />
                        <div>남자</div>
                    </label>

                    <label class="button-checkbox w-full">
                        <input
                            type="radio"
                            hidden
                            value="여자"
                            bind:group={gender}
                        />
                        <div>여자</div>
                    </label>
                </div>
            </div>

            <div class="mb-6">
                <div class="mb-1">연령</div>
                <div>
                    <input
                        type="text"
                        class="border w-2/3 py-2 px-3 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                        bind:value={age}
                    />
                </div>
                <div class="text-gray-600 text-xs mt-1 ml-1">
                    나이를 입력 해 주세요.
                </div>
            </div>

            <div class="mb-6">
                <div class="mb-1">경력</div>

                {#if careerList.length > 0}
                    <table class="w-full mb-5">
                        <tbody>
                            {#each careerList as val, idx}
                                <tr>
                                    <td
                                        class="border border-gray-300 p-2.5 text-sm"
                                    >
                                        <div
                                            class="flex justify-between items-center"
                                        >
                                            <span>{val}</span>
                                            <button
                                                class="cursor-pointer"
                                                value={idx}
                                                on:click={deleteCareerList}
                                            >
                                                <svg
                                                    width="25px"
                                                    height="25px"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    ><path
                                                        d="M19 13H6v-1h13zM12.5 2.2a10.3 10.3 0 1 0 10.3 10.3A10.299 10.299 0 0 0 12.5 2.2zm0 19.6a9.3 9.3 0 1 1 9.3-9.3 9.31 9.31 0 0 1-9.3 9.3z"
                                                    /><path
                                                        fill="none"
                                                        d="M0 0h24v24H0z"
                                                    /></svg
                                                >
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}

                <div class="flex items-center gap-2">
                    <input
                        type="text"
                        class="border w-full py-2 px-3 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                        bind:value={careerSplit}
                        on:input={(e) => {
                            e.target.value = e.target.value.replace(/\|/g, "");
                        }}
                    />

                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                        class="cursor-pointer"
                        on:click={() => {
                            careerList.push(careerSplit);
                            careerSplit = "";
                        }}
                    >
                        <svg
                            fill="#000000"
                            width="30px"
                            height="30px"
                            viewBox="0 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M16 0c-8.836 0-16 7.163-16 16s7.163 16 16 16c8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 30.032c-7.72 0-14-6.312-14-14.032s6.28-14 14-14 14 6.28 14 14-6.28 14.032-14 14.032zM23 15h-6v-6c0-0.552-0.448-1-1-1s-1 0.448-1 1v6h-6c-0.552 0-1 0.448-1 1s0.448 1 1 1h6v6c0 0.552 0.448 1 1 1s1-0.448 1-1v-6h6c0.552 0 1-0.448 1-1s-0.448-1-1-1z"
                            ></path>
                        </svg>
                    </button>
                </div>
                <div class="text-gray-600 text-xs mt-1 ml-1">
                    경력을 한줄 씩 입력 후 + 버튼을 클릭 해 주세요
                </div>
            </div>

            <div class="mb-6">
                <div class="mb-1">자기소개</div>
                <div>
                    <textarea
                        class="border w-full py-2 px-3 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-sm"
                        rows="6"
                        bind:value={introduction}
                    ></textarea>
                </div>
            </div>

            <div class="text-center">
                {#if authBool}
                    <button
                        class="btn btn-error w-1/3 text-white"
                        on:click={() => {
                            skipModal = true;
                        }}
                    >
                        건너뛰기
                    </button>
                {/if}
                <button
                    class="btn btn-info w-1/3 text-white"
                    on:click={uploadMyTalent}
                >
                    내 인재 정보 등록 하기
                </button>
            </div>
        </div>
    </div>
</SsgoiTransition>

<style>
    .button-checkbox div {
        display: block;
        background-color: #f0f0f0;
        color: #333;
        font-size: 14px;
        border: 1.5px solid #ccc;
        border-radius: 5px;
        padding: 8px 0;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    }

    .button-checkbox input[type="checkbox"]:checked + div {
        background-color: #08b9ff;
        color: white;
        border-color: #0099ff;
    }

    .button-checkbox input[type="radio"]:checked + div {
        background-color: #08b9ff;
        color: white;
        border-color: #0099ff;
    }
</style>
