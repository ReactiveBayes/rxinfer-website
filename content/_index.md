---
####################### Banner #########################
banner:
  title : "RxInfer.jl"
  image : "images/ssm_model.svg"
  content : "Julia package for automatic Bayesian inference on a factor graph with reactive message passing"

##################### Feature ##########################
feature:
  enable : true
  feature_item:
    # feature item loop
    - name : "User Friendly"
      icon : "fas fa-code"
      content : "Clean specification of probabilistic models and inference constraints."
      
    # feature item loop
    - name : "Reactive"
      icon : "fas fa-code-compare"
      content : "Schedule-free message passing-based inference for streaming datasets"
      
    # feature item loop
    - name : "Hybrid Inference"
      icon : "fas fa-shapes"
      content : "Support for hybrid models combining discrete and continuous latent variables."
      
    # feature item loop
    - name : "High Performance"
      icon : "fas fa-tachometer-alt"
      content : "Scalability for large models with millions of parameters and observations."
      
    # feature item loop
    - name : "Extensible"
      icon : "fa-solid fa-cubes"
      content : "Easy to extend with custom nodes."

    # feature item loop
    - name : "Differentiable"
      icon : "fa-solid fa-florin-sign"
      content : "The entire inference procedure is differentiable."
      


######################### Service #####################
service:
  enable : true
  service_item:
    # service item loop
    - title : "Hello world in RxInfer.jl"
      images:
      - ""
      content : "In this example the goal is to estimate hidden states of a Linear Dynamical process where all hidden states are Gaussians."
      code: "{{< highlight julia>}} 
                    @model function check()
                    a = 1
             {{< /highlight>}}"
      button:
        enable : true
        label : "Check it out"
        link : "#"
        
    # service item loop
    - title : "Hybrid Message Passing"
      images:
      - ""
      content : "hz"
      code: "{{< highlight julia>}} 
                    @model function check()
                    a = 1
             {{< /highlight>}}"
      button:
        enable : true
        label : "Check it out"
        link : "#"
        
    # service item loop
    - title : "Balck-box inference"
      images:
      - "images/service-2.png"
      content : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat tristique eget amet, tempus eu at consecttur. Leo facilisi nunc viverra tellus. Ac laoreet sit vel consquat. consectetur adipiscing elit. Consequat tristique eget amet, tempus eu at consecttur. Leo facilisi nunc viverra tellus. Ac laoreet sit vel consquat."
      button:
        enable : true
        label : "Check it out"
        link : "#"
        
################### Screenshot ########################
screenshot:
  enable : false
  title : "Experience the best <br> workflow with us"
  image : "images/rxinfer.svg"

  

##################### Call to action #####################
call_to_action:
  enable : false
  title : "Ready to get started?"
  image : "images/rxinfer.svg"
  content : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat tristique eget amet, tempus eu at consecttur."
  button:
    enable : true
    label : "Contact Us"
    link : "contact/"
---