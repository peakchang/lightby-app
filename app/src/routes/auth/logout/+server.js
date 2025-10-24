import { error, json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import bcrypt from 'bcrypt';
import axios from "axios";
import { back_api } from "$lib/const.js";
/*
>> 프론트에서 가져온 추가 정보들로 DB 입력 / JWT토큰 생성해서 아이디 값 저장 / 다시 DB에 토큰 값 저장하기!
>> 이후 리턴 한 다음에 프론트에서 메인페이지로 refresh 하기!!
*/
export async function POST({ request, cookies }) {

    const body = await request.json();
    try {

        const res = await axios.post(`${back_api}/auth/logout`, { idx: body.idx })

        cookies.delete('access_token', { path: '/' })
        cookies.delete('refresh_token', { path: '/' })
    } catch (error) {

    }

    return json({})
}

