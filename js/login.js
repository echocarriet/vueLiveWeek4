const app = Vue.createApp({
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io',
            path: 'carrie',
            user: {
                username: '',
                password: ''
            },
            page: 'products.html',
        }
    },
    methods: {
        login() {
            axios.post(`${this.apiUrl}/admin/signin`, this.user)
                .then((res) => {
                    console.log(res);
                    const { token, expired } = res.data;
                    if (res.data.success) {
                        document.cookie = `carrieHexToken=${token}; expires=${new Date(expired)}; path=/`;
                        window.location = `${this.page}`;
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        }
    }
})
app.mount('#app');