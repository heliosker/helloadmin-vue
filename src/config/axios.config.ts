import axios, { AxiosResponse } from 'axios'
import { message } from 'ant-design-vue';
import store from '@/store/index'
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

nprogress.configure({showSpinner: false});
const CancelToken: any = axios.CancelToken; // axios 的取消请求
const service = axios.create({
    timeout: 5000,  // 超时时间
    withCredentials: true,
    headers: {
        'ContentType': 'application/json',
        'Authorization': `Bearer ${store.state.login.tokenInfo.access_token}`
    }
})

// 防止重复提交
const pending: any[] = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识

/**
 * 取消重复请求
 * @param config
 * @param f
 */
const removePending: any = (config: any, f: any) => {
    const flgUrl = config.url;
    if ( pending.indexOf(flgUrl) !== -1 ) {
        if ( f ) {
            f('取消重复请求');
        } else {
            pending.splice(pending.indexOf( flgUrl ), 1); // 删除储存记录
        }
    } else {
        if ( f ) {
            pending.push( flgUrl )
        }
    }
  }
/* 请求拦截 */
service.interceptors.request.use((config: any) => {
    nprogress.start();
    if ( !config.neverCancel ) {
        // 生成canalToken
        // config.cancelToken = new CancelToken((c: any) => {
        //     removePending(config, c)
        // })
      }
    return config
}, (err: any) => {
    nprogress.done()
    Promise.reject(err)
})

/* 响应拦截 */
service.interceptors.response.use((response: AxiosResponse) => {
    nprogress.done()
    // removePending( response.config );
    return response
}, (err: any) => {
    nprogress.done()
    message.error(err.response.message)
    return Promise.reject(err)
})

export default service