package com.planta.mantenimiento.data.network

import okhttp3.ResponseBody
import retrofit2.http.GET

interface VpnApiService {

    @GET("api/vpn/config")
    suspend fun getConfig(): ResponseBody
}