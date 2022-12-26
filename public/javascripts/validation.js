var errorName = document.getElementById('name')
var errorEmail = document.getElementById('email')
var errorPassword = document.getElementById('passwords')
var errorcPassword = document.getElementById('cpasswords')
var errorPhonenumber = document.getElementById('mobile')
function validateName() {
    const name = document.getElementById('name').value;
    if (name == "") {
        errorName.innerHTML = 'Enter your Name'
        return false
    }
    if (!name.match(/^[a-zA-Z ]*$/)) {
        errorName.innerHTML = 'Number are not allowed'
        return false
    }
     if (name.match(/^[ ]*$/)) {
        errorName.innerHTML = 'enter a valid name'
        return false
    }
    errorName.innerHTML = null
    return true
}
function validEmail() {
    const email = document.getElementById('email').value
    if (email == "") {
        errorEmail.innerHTML = "enter you email address"
        return false
    }
    if (!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)) {
        errorEmail.innerHTML = 'enter a proper email address'
        return false
    }
    errorEmail.innerHTML = null
    return true
}
function validPassowrd() {
    const psd = document.getElementById('password').value
    if (psd == "") {
        errorPassword.innerHTML = "enter a password"
        return false
    }
    if (psd.length < 5) {
       
        errorPassword.innerHTML = "password should be more than five characters"
        return false
    }
    errorPassword.innerHTML = null
    return true
}

function cPassowrd() {
    const psd = document.getElementById('password').value
    const cpsd = document.getElementById('cpassword').value
    if (cpsd == "") {
        errorcPassword.innerHTML = "enter a password"
        return false
    }
    if (cpsd !== psd) {
       
        errorcPassword.innerHTML = "password is not matching"
        return false
    }
    errorcPassword.innerHTML = null
    return true
}

 function validPhonenumber() {
    const mob = document.getElementById('mobile').value
    if (mob == "") {
        errorPhonenumber.innerHTML = "enter a phonenumber"
        return false
    }
    if(!mob.match(/^[0-9]{10}$/)){
        errorPhonenumber.innerHTML = "Enter valid phone number"
        return false
    }
    errorPhonenumber.innerHTML = null
    return true
}

    function check(){
          let validatearray =[!validateName() , !validEmail() , !validPassowrd() , !validPhonenumber() , !cPassowrd()]

          return validatearray.every(validation)
         

    }



function validateForm() {
    if (!validateName() || !validEmail() || !validPassowrd() || !validPhoneumber() || !cPassowrd()) {
        return false
    }
    return true
}
