
# formydable
This is a react form validator that is delightfully made by mytabowrks which is blazingly fast and can be easily use and implement in any field components with ease.

- [Installation](#installation)
- [How To Use](#how-to-use)
    - [Importing](#imports) 
    - [Basic Usage](#basic-usage)
    - [Advance Usage](#advance-usage)
        - [Register OtherFields](#register-otherfields)
    - [Alias Registry Usage](#alias-registry-usage)
- [Rules](#rules) 
    - [Validator Main Rules](#validator-main-rules)
    - [Validator Extension Rules](#validator-extension-rules) 
    - [Handle extend rules and extend customize rules](#handle-extend-rules-and-extend-customize-rules)
- [Types](#types)
    - [useForm types](#useform-types)
        - [formState types](#formstate-types)
        - [formUpdate types](#formupdate-types)
        - [formRegistry types](#formregistry-types)
        - [formSubmit types](#formsubmit-types) 
            - [FormEvent methods which produce by formSubmit](#formevent-methods-which-produce-by-formsubmit)
    - [useFormState Parameter](#useformstate-parameter)
    - [FormStateProvider Properties](#formstateprovider-properties)
- [License](#license)

# installation
```
npm i formydable
```

or

```
yarn add formydable
```

# How to use


## imports
```js
import { useForm, FormStateProvider, useFormState } from "formydable"
```
## Important Note
The rules key name and the form fields name must be exactly the same, unless you use [aliasing registry](#alias-registry-usage).<br/>

## Basic Usage
This is how easily it can be done. We use `useForm` to register rules and use-<br/>
`formState` to get the form field statuses,<br/>
`formUpdate` to update the form field statuses,<br/>
`formSubmit` to handle the submition of form field, and lastly <br/>
`formRegistry` to register the form field in child component. we will use it in Advance Usage<br/>

```js
import React from "react"
import { useForm } from "formydable"

export const FormFields = () => {
    const defaultRegistry = {
        fname: { label: 'First Name', rules: 'required|alpha|min:3' },
        lname: { label: 'Last Name', rules: 'required|alpha|min:3|max:20' }
    };
    
    const [formState, formUpdate, formSubmit] = useForm(defaultRegistry);

    const { fname, lname } = formState();

    const handleFieldChange = (event) => {
        formUpdate({ target: event.target });
    };

    const formSubmitHandler = formSubmit((event) => {
        if (event.isReady()) {
            console.log(event.json(), event.param(), event.formData())
        } else {
            console.log('fail')
            event.locateFailed()
        }
    }); 
    
    return ( 
        <form onSubmit={formSubmitHandler}> 
            <input 
                name='fname'
                placeholder='first name...'
                onChange={handleFieldChange}
            />
            {fname && fname.isInvalid && <p><i>{fname.message}</i></p>} 
            <input 
                name='lname'
                placeholder='last name...'
                onChange={handleFieldChange}
            />
            {lname && lname.isInvalid && <p><i>{lname.message}</i></p>} 
            <button type='submit'>Submit</button>
        </form> 
    );
}
```


## Advance Usage
We use `FormStateProvider` to provide `formState`, `formUpdate` and `formRegistry` to children components.<br/>
We import component `OtherFields` as a example on how to use `FormStateProvider` and `useFormState` together</br>
`OtherFields` can be seen after this section.</br>

```js
import React from "react"
import { useForm, FormStateProvider } from "formydable"
import { OtherFields } from "./OtherFields"

export const PersonalFormFields = () => {
    const defaultRegistry = {
        fname: { label: 'First Name', rules: 'required|alpha|min:3' },
        lname: { label: 'Last Name', rules: 'required|alpha|min:3|max:20' }
    };
    
    const [formState, formUpdate, formRegistry, formSubmit] = useForm(defaultRegistry);

    const { fname, lname } = formState();

    const handleFieldChange = (event) => {
        formUpdate({ target: event.target });
    };

    const formSubmitHandler = formSubmit((event) => {
        if (event.isReady()) {
            console.log(event.json(), event.param(), event.formData())
        } else {
            console.log('fail')
            event.locateFailed()
        }
    }); 

    const formStateValue = { formState, formUpdate, formRegistry }
    
    return ( 
        <FormStateProvider value={formStateValue}>
            <form onSubmit={formSubmitHandler}> 
                <input 
                    name='fname'
                    placeholder='first name...'
                    onChange={handleFieldChange}
                />
                {fname && fname.isInvalid && <p><i>{fname.message}</i></p>} 
                <input 
                    name='lname'
                    placeholder='last name...'
                    onChange={handleFieldChange}
                />
                {lname && lname.isInvalid && <p><i>{lname.message}</i></p>}
                
                <OtherFields/>
                
                <button type='submit'>Submit</button>
            </form>
        </FormStateProvider> 
    );
}
```


### Register `OtherFields`
This is the component we use in Advance Usage as additional fields.<br/>
here we use `useFormState` to get `FormStateProvider` provided to children components.<br/>

```js 
import React from "react"
import { useFormState } from "formydable"

export const OtherFields = () => { 
    
    const { formState, formUpdate, formRegistry } = useFormState();

    const { email, resume } = formState();

    const addRegisties = [
        { name: 'email', label: 'E-mail', rules: 'required|email' },
        { name: 'resume', label: 'Resume', rules: 'required|mimes:pdf,jpg,png' }
    ];

    addRegisties.forEach(registry => formRegistry(registry))

    const handleFieldChange = (event) => {
        formUpdate({ target: event.target });
    }; 
    
    return (
        <React.Fragment>
            <input 
                name='email'
                placeholder='email@web'
                onChange={handleFieldChange}
            />
            {email && email.isInvalid && <p><i>{email.message}</i></p>} 
            <input 
                type='file'
                name='resume'
                placeholder='provide resume'
                onChange={handleFieldChange}
            />
            {resume && resume.isInvalid && <p><i>{resume.message}</i></p>}
        </React.Fragment>
    );
}
```

## Alias Registry Usage
It is inevitable that some form fields are multiple with the same name on it, the problem is we wanted to add those new or other fields into form state registry. for that reason formydable use alias registry and make a counter measure about those stuffs.<br/><br/>
```js
import React from 'react' 
import { useFormState } from 'formydable'

/*I don`t know how you handle unique ids but, this is just for show*/
let unique = 0;
const uid = () => unique++;

export const FavoriteField = ({name, label, rules}) => {
	const { formUpdate, formRegistry } = useFormState();

	formRegistry({ name, label, rules });

	const handleFieldChange = (event) => {
		const updateAliasRegistry = name;
		formUpdate({ target: event.target }, updateAliasRegistry);
	};

	return (
		<input
			name='favorites[]'
			data-alias={name}
			onChange={handleFieldChange}
		/>
	);
};

export const Favorites = () => {
	const [fields, setFields] = React.useState([
		{ name: 'favorites', label: 'Favorites', rules: 'required|alpha' }
	]);

	const { formState } = useFormState();

	return fields.map((field, index) => {
		const eachstate = formState(field.name);
		return (
			<React.Fragment key={field.name}>
				<div style={{ display: 'flex' }}>
					<FavoriteField {...field} />
					{index === 0 ? (
						<button
							type='button'
							onClick={() =>
								setFields((state) => [
									...state,
									{
										name: `favorites-${uid()}`,
										label: 'Favorites',
										rules: 'required|alpha'
									}
								])
							}>
							add
						</button>
					) : (
						<button
							type='button'
							onClick={() =>
								setFields((state) =>
									state.filter((value) => value.name !== field.name)
								)
							}>
							remove
						</button>
					)}
				</div>
				{eachstate && eachstate.isInvalid && (
					<p>
						<i>{eachstate.message}</i>
					</p>
				)}
			</React.Fragment>
		);
	});
};
```

# Rules
Since `formydable` is using [mytabworks-utils](https://github.com/mytabworks/mytabworks-utils#readme) `Validator` as the core form validator tool. and you can use it too by importing `mytabwork-utils`!<br/>
`Validator` has two section of rules the [main rules](https://github.com/mytabworks/mytabworks-utils#validator-main-rules) which are the commonly use rules and the [extend rules](https://github.com/mytabworks/mytabworks-utils#validator-extension-rules) which are the extensible and the "not" commonly use rules. The reason why it is seperated, is to reduce the payload of an unuse rules.<br/> 
You can read further on how to [extend rules](https://github.com/mytabworks/mytabworks-utils#validator-extend-rules-usage) and make [custom rules](https://github.com/mytabworks/mytabworks-utils#validator-customize-rule-usage) in [mytabworks-utils](https://github.com/mytabworks/mytabworks-utils#readme) docs.<br/><br/>

## Validator Main Rules
The main validation rules which is commonly use.

|NAME         |HOW TO USE                      |DESCRIPTION| MESSAGE |
|-------------|---------------------------|-------------|-------------|
| required    | required                  | it will require the form field to be filled| The :attribute field is required |
| email       | email                     | it will validate if the field contain a valid e-mail| The :attribute field must be valid email|
| min         | min:<number>              | it will validate the minumum character, number, checkbox is checked, select(multiple) is selected, file(multiple) is selected. `ex. min:10` | The :attribute field must be atleast :min (character, items, files) |
| max         | max:<number>              | it will validate the maximum character, number, checkbox is checked, select(multiple) is selected, file(multiple) is selected. `ex. max:20` | The :attribute field may not be greater than :max (character, items, files) |
| mimes       | mimes:<mime_types>        | it will validate the specific mimes of the files which are allowed. `ex. mimes:jpg,pdf,rar`| The :attribute only allows :mimes|
| alpha       | alpha                     | it will validate if the field value is only contain letter | The :attribute may only contain letters|

## Validator Extension Rules
The extension rules can only be use by extending and importing [`mytabworks-utils/extend/rules`](https://github.com/mytabworks/mytabworks-utils#validator-extend-rules-usage). these validation rules are excluded in the main rules because these are not often use in the form, so to reduce the payload mytabworks decided to remove these from the main list and became an extension when needed.
|NAME       |HOW TO USE                        |DESCRIPTION| MESSAGE |
|-------------|---------------------------  |-------------|-------------|
| alpha_space | alpha_space       | it will validate if the field only contain letters with spaces | The :attribute must contain alphabet with spaces |
| alpha_num   | alpha_num                   | it will validate if the field contain letters with numbers| The :attribute may only contain letters and numbers.|
| alpha_dash  | alpha_dash                  | it will validate if the field contain letters with numbers and dashes | The :attribute may only contain letters, numbers, and dashes.|
| url         | url                         | it will validate if the field contain valid url | The :attribute must be a valid url. |
| max_size    | max_size:<number>           | it will validate if the field contain a maximum file size and the size must calculate in kilobytes. `ex. max_size:5000`| The :attribute may not be greater :max_size kilobytes.|
| min_size    | min_size:<number>           | it will validate if the field contain a minimum file size and the size must calculate in kilobytes. `ex. min_size:1000`| The :attribute must be atleast :min_size kilobytes.|
| required_if | required_if:<target_field_name>=<target_expected_value> | it will require the field, if the target field matches the expected value. you can use exact value or regular expression like `required_if:bio=.+`. `.+` means has any value. `ex. required_if:country=AU` since most of the time field names are not the same as the labels and same with the values label. that is why you can use Aliasing(@) `ex. required_if:country@Country=AU@Australia`  | The :attribute field is required when :required_if is :third_party. | 
| same        | same:<target_field_name>               | it will validate the field until the target field contain the same value. `ex. same:pass` since most of the time field names are not the same as the labels you can use Aliasing(@) `ex. same:pass@Password` | The :attribute and :same must match. |

## Handle extend rules and extend customize rules
As metion in previous section `Validator` rules is extensible which is customize rules are applicable.<br/>
For further idea on customizing rules you can visit [here](https://github.com/mytabworks/mytabworks-utils#validator-customize-rule-usage)<br/><br/>
>
```js
import React from "react"
import { useForm } from "formydable"
import { Validator } from "mytabworks-utils"
import { same, max_size } from "mytabworks-utils/extend/rules"

const strong_password = {
    regexp: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/g,
    exe(received, first_param, second_param ) {
        /*
        recieved - it is the received value of the field
        first_param - rules:<first_param> it is use when custom rules have first parameter like min, max, mimes, etc.
        second_param - rules:<first_param>=<second_param> it is use when custom rules have first and second parameter like required_if.
        */

        /*first_param and second_param are not needed for this validation*/
        /*note! must return true when it is INVALID*/
        return !this.regexp.test(received)
    },
    message: "The :attribute must have 1 small letter, 1 capital letter, 1 number, and 1 special character"
    /*note! in messages
        the :attribute is replace by the label inputed.
        the name of the rule like :strong_password can be use to replace by first_param inputed
        the :third_party is replace by the second_param 
    */
}

Validator.rulesExtend({ same, max_size, strong_password })

export const FormFields = () => {
    const defaultRegistry = {
        fname: { label: 'First Name', rules: 'required|alpha|min:3' },
        lname: { label: 'Last Name', rules: 'required|alpha|min:3|max:20' },
        pass: { label: 'Password', rules: 'required|min:8|strong_password' },
        confirm_pass: { label: 'Confirm Password', rules: 'same:pass@Password' },
        resume: { label: 'Resume', rules: 'required|max_size:5000|mimes:pdf,jpg,png' }
    
    const [formState, formUpdate, formSubmit] = useForm(defaultRegistry);

    const { fname, lname, pass, confirm_pass, resume } = formState();

    const handleFieldChange = (event) => {
        formUpdate({ target: event.target });
    };

    const formSubmitHandler = formSubmit((event) => {
        if (event.isReady()) {
            console.log(event.json(), event.param(), event.formData())
        } else {
            console.log('fail')
            event.locateFailed()
        }
    }); 
    
    return ( 
        <form onSubmit={formSubmitHandler}> 
            <input 
                name='fname'
                placeholder='first name...'
                onChange={handleFieldChange}
            />
            {fname && fname.isInvalid && <p><i>{fname.message}</i></p>} 
            <input 
                name='lname'
                placeholder='last name...'
                onChange={handleFieldChange}
            />
            {lname && lname.isInvalid && <p><i>{lname.message}</i></p>} 
            <input 
                type="password"
                name='pass'
                placeholder='first name...'
                onChange={handleFieldChange}
            />
            {pass && pass.isInvalid && <p><i>{pass.message}</i></p>} 
            <input 
                type="password"
                name='confirm_pass'
                placeholder='last name...'
                onChange={handleFieldChange}
            />
            {confirm_pass && confirm_pass.isInvalid && <p><i>{confirm_pass.message}</i></p>} 
            <input 
                type='file'
                name='resume'
                placeholder='provide resume'
                onChange={handleFieldChange}
            />
            {resume && resume.isInvalid && <p><i>{resume.message}</i></p>}
            <button type='submit'>Submit</button>
        </form> 
    );
}
```


# Types
when you see `:` it means required if you see `?:` it means optional<br/>

## useForm types

```js
useForm(registry: { [name: string]: { label: string, rules: string } }): [formState, formUpdate, formSubmit, formRegistry]
```

### formState types

when passing name by parameter, it will only get that name field state
```js
formState(name?: string): { label: string, rules: string, isInvalid: boolean, message: null|string }
```
when no parameter, it will get all form states
```js
formState(): { [name: string]: { label: string, rules: string, isInvalid: boolean, message: null|string } } 
```

### formUpdate types

```js
formUpdate({ target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement }, alias?: string): void
```

### formRegistry types

```js
formRegistry({ name: string, label: string, rules: string }): void
```

### formSubmit types

```js
formSubmit((event: FormEvent) => void): void
```
#### FormEvent methods which produce by formSubmit

All properties that is supported by instance FormEvent.<br/>

|METHODS      |RETURNS      |DESCRIPTION|
|---------------|---------------|-------------|
|.target        | form element  | It will get the form element.|
|.locateFailed()| integer       | It will locate the form field that fails the requirements. you can adjust the position by passing a int parameter .locateFailed(70/*default is 40*/) depends on your navbar height if it is floating|
|.isReady()     | boolean       | It will check if the form is ready and passed all the requirement rules.|
|.json()        | object        | It will return the form data in json.|
|.paramArray()  | array         | It will return the form data in array.|
|.param()       | string        | It will return the form data in url encode string.|
|.formData()    | FormData      | it will return instance of FormData.|
|.forEach(/*callback*/)| void      | it will loop each of the form data.|

## useFormState Parameter

```js
useFormState<any>(): any 
```

## FormStateProvider Properties
All properties that is supported by Select Component.<br/>
The datatypes with "*" means it is required.

|`PROPERTY`   |`TYPES`    |`DEFAULT`    |`DESCRIPTION`|
|-------------|---------------|-------------|-------------| 
| value       | object        |   &nbsp; | the value you want to provide in children by using `useFormState`| 
| children    | ReactNode     |      &nbsp; | the form | 


## License
MIT Licensed. Copyright (c) Mytabworks 2020.