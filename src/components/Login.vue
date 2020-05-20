<template>
    <div>
        <h4>Login</h4>
        <form>
            <label for="email">E-mail Address</label>
            <div>
                <input type="email" name="email" id="email" v-model="email" required>
            </div>
            <div>
                <label for="password">Password</label>
                <div>
                    <input type="password" name="password" id="password" v-model="password" required>
                </div>
            </div>
            <div>
                <button type="handleSubmit" @click="submit">Login</button>
            </div>
        </form>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            email : "",
            password : ""
        }
    },
    methods: {
        handleSubmit(e){
            e.preventDefault()
            if (this.password.length > 0) {
                this.$http.post('https://localhost:3000/login', {
                    email: this.email,
                    password: this.password
                })
                .then(response => {
                    let is_admin = response.data.user.is_admin
                    localStorage.setItem('user', JSON.stringify(response.data.user))
                    localStorage.setItem('jwt', response.data.token)

                    if (localStorage.getItem('jwt') != null) {
                        this.$emit('loggedIn');
                        if (this.$route.params.nextUrl != null) {
                            this.$router.push(this.$route.params.nextUrl)
                        }
                        else {
                            if (is_admin == 1) {
                                this.$router.push('admin')
                            }else{
                                this.$router.push('dashboard')
                            }
                        }
                    }
                })
                .catch(function (error){
                    console.error(error.response);
                })
            }
        }
    },
}
</script>