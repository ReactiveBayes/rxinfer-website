---
####################### Banner #########################
banner:
  title : "RxInfer.jl"
  image : "images/rxinfer_landing.png"
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
      content : "RxInfer is extremely fast when dealing with state-space models. Take a look how easy it is to specify an SSM and run inference!"
      code: "{{< highlight julia>}} 
                    @model function SSM(n, x0, A, B, Q, P) \n
                    \n
                    \t # x is a sequence of hidden states \n
                    \t x = randomvar(n) \n
                    \t # y is a sequence of clamped observations \n
                    \t y = datavar(Vector{Float64}, n) \n
                    \n
                    \t x_prior ~ MvNormal(μ=mean(x0), Σ=cov(x0)) \n 
                    \t x_prev = x_prior \n
                    \n
                    \t for i in 1:n \n
                    \t\t   x[i] ~ MvNormal(μ=A*x_prev, Σ=Q) \n
                    \t\t   y[i] ~ MvNormal(μ=B*x[i], Σ=P) \n
                    \t\t   x_prev = x[i] \n
                    \t end \n
                    \n
                    \t return x, y \n
                end \n
                \n
                \n
                result = inference(\n
                \tmodel = Model(SSM, length(y), x0, A, B, Q, P), \n
                \tdata  = (y = y,)\n
                );
             {{< /highlight>}}"
      button:
        enable : true
        label : "Check it out"
        link : "//biaslab.github.io/ReactiveMP.jl/stable/examples/linear_gaussian_state_space_model/"
        
    # service item loop
    - title : "Fast Bayesian Inference"
      images:
      - "images/lg-ssm.png"
      - "images/performance.png"
      - "images/tmp.gif"
      content : "RxInfer exploits the modularity of factor graphs to achieve fast inference. It uses hybrid methods that combine factorization and form constraints, and formalize well-known algorithms in terms of message passing. "
      button:
        enable : true
        label : "Check it out"
        link : "#"
        
    # service item loop
    - title : "Stochastic Inference"
      images:
      - "images/lg-ssm.png"
      - "images/performance.png"
      content : "RxInfer comes with stochastic approximation engines such as Conjugate-Computation Variational Inference (CVI). CVI provides principled methods to integrate fast deterministic inference techniques with broadly applicable stochastic approximate inference."
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