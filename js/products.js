import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';
import pagination from './pagination.js';

//取 DOM → 給 BS Modal 使用
let productModal = '';
let delProductModal = '';

const app = createApp({
    data() {
        return {
            apiUrl: 'https://vue3-course-api.hexschool.io/',
            path: 'carrie',
            productsData: [],
            isNew: false,  //用來判斷是編輯或新增狀態 (因是同個 modal)
            tempProduct: {  //用來存 productsData 的單筆資料
                imagesUrl: [],
            },
            pagination: {},
        }
    },
    components: {
        pagination, 
    },
    methods: {
        getProductData(page) {   //取得產品資料
            const url = `${this.apiUrl}api/${this.path}/admin/products?page=${page}`;
            axios.get(url)
                .then((res) => {
                    console.log(res);
                    if (res.data.success) {
                        this.productsData = res.data.products;
                        this.pagination = res.data.pagination;
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        //POST/PUT 後台新增/編輯產品資訊
        //觸發在 Modal 內的按鈕

        updateProducts(tempProduct) {   //產品資料 ( 新增 & 修改 )
            //新增狀態

            let url = `${this.apiUrl}api/${this.path}/admin/product`;
            let httpMethod = 'post';
            //根據isNew 判斷要串接 post 或是 put API
            //!為反轉意思。判斷不是isNew原本狀態就帶入編輯狀態
            if (!this.isNew) {
                //編輯狀態
                url = `${this.apiUrl}api/${this.path}/admin/product/${tempProduct.id}`;
                httpMethod = 'put';
            }

            //POST 和 PUT 架構一樣(除了post put api 第二個參數不同)所以可以寫一起再另外處裡
            // axios.post(api, {})
            // .then(() => {})
            // .catch(() => {})

            // axios.put(api, {})
            // .then(() => {})
            // .catch(() => {})

            //因為httpMethod是變數的關係，所以使用中括號[]取代點.，物件取值的概念 (axios.httpMethod)
            axios[httpMethod](url, { data: tempProduct })
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message)
                        productModal.hide();  //新增或編輯某狀態成功後，關掉 Modal
                        this.getProductData();  //重新渲染畫面
                    } else {
                        alert(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        delProduct(tempProduct) {   //刪除產品
            const url = `${this.apiUrl}api/${this.path}/admin/product/${tempProduct.id}`;
            axios.delete(url)
                .then((res) => {
                    if (res.data.success) {
                        alert(res.data.message)
                        delProductModal.hide();
                        this.getProductData();  //重新渲染畫面
                    } else {
                        console.log(res.data.message);
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        openModal(isNew, item) {   //BS Modal 設定
            //新增與編輯是同一個 Modal 所以使用 isNew 做判斷目前在哪個狀態。
            if (isNew === 'new') { //新增
                this.tempProduct = {  //此為暫存資料，清空用
                    imagesUrl: [],  //因是第二層所以也需要定義，不然 vue 可能會出錯。
                };
                this.isNew = true;
                //套用BS modal.show() 方法
                productModal.show();
            } else if (isNew === 'edit') { //編輯
                //這邊用淺拷貝，不然修改同時原始資料也會一起修改(物件傳參考原理) 
                // this.tempProduct = { ...item };

                //因為裡面還有一層，所以換成深層拷貝
                this.tempProduct = JSON.parse(JSON.stringify(item));
                this.isNew = false;
                productModal.show();
            } else if (isNew === 'delete') {  //刪除
                this.tempProduct = { ...item }; //modal需拿到title和刪除按鈕時需獲得 id。
                delProductModal.show();
            }
        }

    },
    mounted() {  //created 換成 mounted → 畫面生成完後，再來擷取動元素 DOM
        //------ BS modal 實體化 → BS Modal 中的 Via JavaScript
        //新增的 modal
        productModal = new bootstrap.Modal(document.querySelector('#productModal'), { keyboard: false });
        //刪除的 modal
        delProductModal = new bootstrap.Modal(document.querySelector('#delProductModal'), { keyboard: false });


        //------ 取出 Token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)carrieHexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');

        //------ 排錯
        if (token === '') {
            alert('您尚未登入請重新登入。');
            window.location = 'login.html';
        }
        //------ 所有 axios 請求都會加上 token
        axios.defaults.headers.common['Authorization'] = token;

        this.getProductData();
    },
});
//編輯產品 Modal
app.component('productModal', {
    props: ['tempProduct', 'isNew'],
    template: `<div id="productModal" ref="productModal" class="modal fade" tabindex="-1" aria-labelledby="productModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content border-0">
            <div class="modal-header bg-dark text-white">
                <h5 id="productModalLabel" class="modal-title">
                    <span v-if="isNew">新增產品</span>
                    <span v-else>編輯產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-4">
                        <div class="mb-1">
                            <div class="form-group">
                                <label for="mainImageUrl">主圖網址</label>
                                <input id="mainImageUrl" type="text" class="form-control mb-1" placeholder="請輸入圖片連結"
                                    v-model="tempProduct.imageUrl">
                                <img class="img-fluid" :src="tempProduct.imageUrl">
                            </div>
                        </div>
                        <div class="mb-1">多圖新增</div>
                        <div v-if="Array.isArray(tempProduct.imagesUrl)">
                            <div class="mb-1" v-for="(images , key) in tempProduct.imagesUrl" :key="images">
                                <div class="form-group">
                                    <label for="imageUrl">輸入圖片網址 {{ key + 1 }}</label>
                                    <input type="text" class="form-control mb-1" placeholder="請輸入圖片連結"
                                        v-model="tempProduct.imagesUrl[key]">
                                    <img class="img-fluid" :src="tempProduct.imagesUrl[key]">
                                </div>
                            </div>
                            <div
                                v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                                <button class="btn btn-outline-primary btn-sm d-block w-100"
                                    @click="tempProduct.imagesUrl.push('')">
                                    新增圖片
                                </button>
                            </div>
                            <div v-else>
                                <button class="btn btn-outline-danger btn-sm d-block mb-1 w-100"
                                    @click="tempProduct.imagesUrl.pop()">
                                    刪除圖片
                                </button>
                            </div>
                        </div>
                        <div v-else>
                            <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">
                                新增圖片
                            </button>
                        </div>
                    </div>
                    <div class="col-sm-8">
                        <div class="form-group">
                            <label for="title">標題</label>
                            <input id="title" type="text" class="form-control" placeholder="請輸入標題"
                                v-model="tempProduct.title">
                        </div>

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="category">分類</label>
                                <input id="category" type="text" class="form-control" placeholder="請輸入分類"
                                    v-model="tempProduct.category">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="unit">單位</label>
                                <input id="unit" type="text" class="form-control" placeholder="請輸入單位"
                                    v-model="tempProduct.unit">
                            </div>
                        </div>

                        <div class="row">
                            <div class="form-group col-md-6">
                                <label for="origin_price">原價</label>
                                <input id="origin_price" type="number" min="0" class="form-control"
                                    placeholder="請輸入原價" v-model.number="tempProduct.origin_price">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="price">售價</label>
                                <input id="price" type="number" min="0" class="form-control" placeholder="請輸入售價"
                                    v-model.number="tempProduct.price">
                            </div>
                        </div>
                        <hr>

                        <div class="form-group">
                            <label for="description">產品描述</label>
                            <textarea id="description" type="text" class="form-control" placeholder="請輸入產品描述"
                                v-model="tempProduct.description">
            </textarea>
                        </div>
                        <div class="form-group">
                            <label for="productContent">說明內容</label>
                            <textarea id="productContent" type="text" class="form-control" placeholder="請輸入說明內容"
                                v-model="tempProduct.content">
            </textarea>
                        </div>
                        <div class="form-group">
                            <div class="form-check">
                                <input id="is_enabled" class="form-check-input" type="checkbox" :true-value="1"
                                    :false-value="0" v-model="tempProduct.is_enabled">
                                <label class="form-check-label" for="is_enabled">是否啟用</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-primary" @click="$emit('update-Product',tempProduct)">
                    確認
                </button>
            </div>
        </div>
    </div>
</div>`,
    methods: {
        createImages() {
            // this.tempProduct.imagesUrl = [];
            // this.tempProduct.imagesUrl.push('');

            this.tempProduct.imagesUrl = ['']
        },
    }
});
//刪除產品 Modal
app.component('deleteProduct', {
    props: ['delProduct'],
    template: `<div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1"
    aria-labelledby="delProductModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0">
            <div class="modal-header bg-danger text-white">
                <h5 id="delProductModalLabel" class="modal-title">
                    <span>刪除產品</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                是否刪除
                <strong class="text-danger">{{ delProduct.title }}</strong> 商品(刪除後將無法恢復)。
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    取消
                </button>
                <button type="button" class="btn btn-danger" @click="$emit( 'emit-del' ,delProduct)">
                    確認刪除
                </button>
            </div>
        </div>
    </div>
    </div>  `,

});

app.mount('#app');