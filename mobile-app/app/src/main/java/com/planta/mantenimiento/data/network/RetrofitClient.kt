package com.planta.mantenimiento.data.network

import com.planta.mantenimiento.data.local.PreferencesManager
import okhttp3.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

    fun get(prefs: PreferencesManager): Retrofit {

        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val original = chain.request()

                val baseUrl = prefs.backendUrl
                    .replace("http://", "")
                    .replace("https://", "")
                    .replace("/", "")

                val host = baseUrl.substringBefore(":")
                val port = baseUrl.substringAfter(":", "1880").toInt()

                val newUrl = original.url.newBuilder()
                    .host(host)
                    .port(port)
                    .build()

                chain.proceed(original.newBuilder().url(newUrl).build())
            }
            .build()

        return Retrofit.Builder()
            .baseUrl("http://placeholder/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}