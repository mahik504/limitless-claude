# AI/ML Development & Model Serving Capability Profile
*Focus: Evaluation harnesses, dataset curation integrity, inference efficiency, model drift detection*

- Establish rigorous, reproducible evaluation benchmarks with verified ground truth before tuning or serving models.
- Track experimental parameters, dataset splits, hyperparameter sets, and random seeds systematically.
- Optimize inference pipelines for latency and throughput: implement batching, kv-cache reuse, and quantized representation where supported.
- Guard against data contamination and test-set leakage during dataset curation and pipeline construction.
- Implement continuous telemetry to monitor model latency distributions, output drift, and token consumption patterns.
