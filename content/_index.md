---
####################### Banner #########################
banner:
  title : "RxInfer"
  image : "images/rxinfer_landing.png"
  content : "Automatic Bayesian Inference through **Reactive Message Passing**"

##################### Feature ##########################
feature:
  title: "Features"
  enable : true
  feature_item:
    # feature item loop
    - name : "User Friendly"
      icon : "fas fa-code"
      content : "Clean specification of probabilistic models and inference constraints."
      
    # feature item loop
    - name : "Streaming datasets"
      icon : "fas fa-code-compare"
      content : "Reactive message passing-based inference for streaming datasets."
      
    # feature item loop
    - name : "Hybrid Models"
      icon : "fas fa-shapes"
      content : "Support for hybrid models combining discrete and continuous latent variables."
      
    # feature item loop
    - name : "Scalable"
      icon : "fas fa-tachometer-alt"
      content : "Scalability for large models with millions of parameters and observations."
      
    # feature item loop
    - name : "Extensible"
      icon : "fa-solid fa-cubes"
      content : "Designed to be extended with custom operations."

    # feature item loop
    - name : "Differentiable"
      icon : "fa-solid fa-florin-sign"
      content : "Supports automatic differentiation packages for parameter tuning."
      


######################### Service #####################
service:
  enable : true
  service_item:
    # service item loop
    - title : "Hello RxInfer!"
      images:
      - ""
      content : "RxInfer.jl is a Julia package that aims to automate inference in your probabilistic models. Specify your model, call the inference function, and the package takes care of the rest. Take a look how simple it is to specify a linear state space model and to run inference in it!"
      code: "{{< code >}}
                \n@model function SSM(n, x0, A, B, Q, P) \n
                    \n
                    \t # x is a sequence of hidden states \n
                    \t x = randomvar(n) \n
                    \n
                    \t # y is a sequence of clamped observations \n
                    \t y = datavar(Vector{Float64}, n) \n
                    \n
                    \t # `~` expression creates a probabilistic relationship\n
                    \t # between random variables\n
                    \t x_prior ~ MvNormal(μ = mean(x0), Σ = cov(x0)) \n 
                    \t x_prev = x_prior \n
                    \n
                    \t # Build the state-space model \n
                    \t for i in 1:n \n
                    \t\t   x[i] ~ MvNormal(μ = A * x_prev, Σ = Q) \n
                    \t\t   y[i] ~ MvNormal(μ = B * x[i], Σ = P) \n
                    \t\t   x_prev = x[i] \n
                    \t end \n
                end \n
                \n
                observations = load_dataset()
                \n
                \n
                result = inference(\n
                \tmodel = SSM(length(observations), x0, A, B, Q, P), \n
                \tdata  = (y = observations,)\n
                )
                {{< /code >}}"
      button:
        enable : true
        label : "Get started now"
        link : "https://biaslab.github.io/ReactiveMP.jl/stable/man/getting-started/"
        
    # service item loop
    - title : "RxInfer is fast"
      images:
      - "images/lgssm_comparison.svg"
      - "images/lgssm_scaling.svg"
      content : "RxInfer exploits the modularity of factor graphs to perform fast message passing-based probabilistic inference that scales linearly with the size of your model. We generally outperform state-of-the-art sampling-based packages by several orders of magnitude. RxInfer supports real-time processing of streaming data sources."
      button:
        enable : true
        label : "Check out some examples"
        link : "https://biaslab.github.io/ReactiveMP.jl/stable/examples/overview/"
        
    # service item loop
    - title : "Solve complex problems"
      images:
      - "images/state_tracking.gif"
      content : "RxInfer solves complex problems through hybrid inference algorithms composed of  (loopy) belief propagation, (structured) variational message passing, expectation propagation, expectation maximization and conjugate-computation variational inference."
      button:
        enable : true
        label : "Research supporting RxInfer"
        link : "https://biaslab.github.io/publication/"
        
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

##################### Ecosystem ##########################
ecosystem:
  title: "Ecosystem"
  content: "The RxInfer ecosystem stacks several Julia packages for running efficient Bayesian inference."
  enable : true
  ecosystem_item:
    # ecosystem item loop
    - name : "Rocket.jl"
      icon : "fas fa-rocket"
      link: "https://github.com/biaslab/Rocket.jl"
      content : "Enables reactive programming in Julia for processing of asynchronous data streams."
      
    # ecosystem item loop
    - name : "ReactiveMP.jl"
      icon : "fas fa-envelope"
      link: "https://github.com/biaslab/ReactiveMP.jl"
      content : "Efficient, easily extensible and schedule-free reactive message passing-based inference engine."
      
    # ecosystem item loop
    - name : "GraphPPL.jl"
      icon : "fas fa-diagram-project"
      link: "https://github.com/biaslab/GraphPPL.jl"
      content : "Powerful, user-friendly, graph-based specification of both model and inference constraints."
---