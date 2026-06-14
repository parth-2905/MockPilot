"""
load_data.py
Loads topics and sample questions into Supabase for MockPilot.
Run from backend/: python -m app.db.load_data
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ── Topics ────────────────────────────────────────────────
# weights are left as None for now, filled in Day 5
TOPICS = [
    "DSA",
    "ML Fundamentals",
    "Algorithm Internals",
    "Deep Learning",
    "Stats & Probability",
    "Evaluation Metrics",
    "SQL",
    "Pandas & Python",
    "ML Case Studies",
    "MLOps Basics",
    "Big Data Basics",
    "OS",
    "DBMS",
    "Computer Networks",
    "OOP",
    "System Design",
    "API Design",
    "Cloud & DevOps",
    "Git & Version Control",
]

# ── Sample Questions ─────────────────────────────────────────
# Format: { "Topic Name": {"easy": [...], "medium": [...], "hard": [...]} }
QUESTIONS = {
    "DSA": {
        "easy": [
            "Find the first non-repeating character in a string.",
            "Reverse a linked list iteratively and recursively.",
            "Check if a binary tree is a valid BST.",
        ],
        "medium": [
            "Find the length of the longest subarray with sum equal to k.",
            "Given an array of intervals, merge all overlapping intervals.",
            "Given a directed graph, return a valid topological ordering and detect whether a cycle exists.",
        ],
        "hard": [
            "Given a grid with obstacles, find unique paths from top-left to bottom-right with at most k obstacle removals.",
            "Solve \"Word Ladder\" — find the shortest transformation sequence between two words using BFS, and discuss optimizations for large dictionaries.",
            "Given two strings, compute their Edit Distance (minimum insertions, deletions, and replacements required to convert one string into the other), and discuss DP optimizations.",
            "Given an undirected graph that starts as a tree with one extra edge added, find the redundant connection using Union-Find and discuss path compression and union by rank.",
            "Given an array of positive integers and an integer m, split the array into m non-empty subarrays such that the largest subarray sum is minimized. Solve using Binary Search on Answer and justify the search space.",
        ],
    },
    "ML Fundamentals": {
        "easy": [
            "What's the difference between bagging and boosting?",
            "Why is feature scaling needed for KNN/SVM but not for tree-based models?",
            "Explain the curse of dimensionality with an intuitive example.",
        ],
        "medium": [
            "A dataset contains low-cardinality and high-cardinality categorical features. Compare One-Hot Encoding, Label Encoding, Target Encoding, Frequency Encoding, and CatBoost Encoding. When would you use each, and what are the risks of target leakage?",
            "Explain why Ridge regression has a closed-form solution but Lasso doesn't.",
            "How does feature engineering for time-series data differ from tabular data (lag features, rolling stats, seasonality encoding)?",
        ],
        "hard": [
            "Derive why ensembling reduces variance using the bootstrap correlation formula.",
            "Explain the mathematical justification for why XGBoost uses second-order (Hessian) information in its loss approximation.",
            "Given a dataset with 500 features and 1000 rows, design a feature selection + regularization strategy and justify each choice mathematically.",
        ],
    },
    "Algorithm Internals": {
        "easy": [
            "How does a decision tree choose a split using Gini impurity vs Entropy?",
            "Explain how K-Means initializes centroids and why it can converge to a local minimum.",
            "How would you tune the hyperparameters of a machine learning model? Compare Grid Search, Random Search, and Bayesian Optimization, and explain the role of cross-validation.",
        ],
        "medium": [
            "Explain gradient boosting as \"gradient descent in function space.\"",
            "Derive the update rule for Adam optimizer and explain the role of the bias-correction terms.",
            "Give an intuitive explanation of PCA and its connection to SVD. Why do the principal components correspond to directions of maximum variance?",
        ],
        "hard": [
            "Explain how the kernel trick lets SVMs operate in higher-dimensional space without explicitly transforming the data, and discuss common kernels and their trade-offs.",
            "Explain how XGBoost's split-finding algorithm uses weighted quantile sketches for approximate splits on large datasets.",
            "Derive the backpropagation-through-time (BPTT) gradient for an RNN and explain why it leads to vanishing/exploding gradients.",
        ],
    },
    "Deep Learning": {
        "easy": [
            "Why is ReLU preferred over sigmoid in hidden layers?",
            "What is batch normalization and why does it help training?",
            "What is a Convolutional Neural Network (CNN)? Explain how convolutional layers and pooling layers help in extracting image features.",
        ],
        "medium": [
            "Derive backpropagation through a single LSTM cell's forget gate.",
            "Explain why dropout acts as a regularizer — what's the mathematical intuition (ensemble of sub-networks)?",
            "Why do transformers use positional encoding, and how does sinusoidal encoding preserve relative position information?",
        ],
        "hard": [
            "Derive the computational complexity of self-attention and explain how Flash Attention reduces memory I/O without changing results.",
            "Explain why residual connections help mitigate vanishing gradients — derive the gradient flow through a residual block.",
            "Given a transformer model overfitting on a small fine-tuning dataset, propose and justify three mitigation techniques (LoRA, layer freezing, data augmentation) with their trade-offs.",
        ],
    },
    "Stats & Probability": {
        "easy": [
            "Explain Bayes' Theorem with a real-world example, and why the prior probability matters.",
            "What is the Central Limit Theorem and why does it matter for sampling?",
            "Differentiate between correlation and causation with an example.",
        ],
        "medium": [
            "Derive the MLE for the parameter λ of a Poisson distribution given n samples.",
            "Explain the difference between a confidence interval and a prediction interval.",
            "Given a p-value of 0.04 from an A/B test, explain what it does and doesn't tell you.",
        ],
        "hard": [
            "Derive the correct test statistic for two A/B variants with unequal sample sizes and variances (Welch's t-test), and explain Simpson's Paradox risk.",
            "Explain Bayesian A/B testing — derive the posterior update for a Beta-Binomial conversion rate model.",
            "Given multiple sequential A/B test peeks causing inflated Type I error, derive why this happens and how alpha-spending functions correct it.",
        ],
    },
    "Evaluation Metrics": {
        "easy": [
            "Why is accuracy misleading for imbalanced datasets — give alternatives.",
            "Explain precision vs recall with a medical diagnosis example.",
            "What does an R² of 0.9 mean, and when can it be misleading?",
        ],
        "medium": [
            "Derive the relationship between precision, recall, and F1; when would you use F2 vs F0.5?",
            "Explain how ROC-AUC is computed and what it represents geometrically.",
            "For a regression model, compare RMSE vs MAE — when does each penalize differently?",
        ],
        "hard": [
            "Given ROC-AUC = 0.95 but poor PR-AUC on a 1:1000 imbalanced dataset, explain mathematically why this discrepancy occurs.",
            "A binary classifier outputs calibrated probabilities. How would you choose the decision threshold for production deployment? Discuss ROC curves, Precision-Recall curves, business costs, class imbalance, and threshold tuning strategies.",
            "Design a custom business-aligned metric for a fraud model where false negatives cost 50x more than false positives — justify the formula.",
        ],
    },
    "SQL": {
        "easy": [
            "Write a query to find the second-highest salary per department.",
            "Write a query to find duplicate rows in a table based on multiple columns.",
            "Explain the difference between UNION and UNION ALL. When would you use each, and what are the performance implications?",
        ],
        "medium": [
            "Write a query using window functions to compute a 7-day rolling average of daily sales.",
            "Write a query to find the running total and rank of employees by salary within each department.",
            "Explain the difference between WHERE and HAVING with a query example using GROUP BY.",
        ],
        "hard": [
            "Write a recursive CTE to find org hierarchy depth for each employee, and explain how the engine executes recursive CTEs.",
            "Given a slow query with multiple JOINs and a GROUP BY, explain how you'd use EXPLAIN ANALYZE to identify and fix the bottleneck.",
            "Design a schema and query to detect \"sessions\" from a clickstream events table (sessionization with gaps > 30 minutes using window functions).",
        ],
    },
    "Pandas & Python": {
        "easy": [
            "Difference between .loc and .iloc — give an example where misuse causes a bug.",
            "What are generators and iterators in Python? How do they improve memory efficiency compared to lists?",
            "Explain mutable vs immutable default arguments in Python functions.",
        ],
        "medium": [
            "Explain the GIL and how it affects multi-threaded vs multi-process pandas operations.",
            "How does apply() differ from vectorized operations in pandas in terms of performance? Give an example.",
            "Explain how merge() handles duplicate keys and what happens to row counts in a many-to-many join.",
        ],
        "hard": [
            "Given a 50GB CSV that doesn't fit in memory, design a pandas pipeline (chunking, dtypes, categorical encoding) for groupby aggregations, and explain the memory tradeoffs.",
            "A pandas pipeline is producing silently incorrect results. Describe a systematic debugging approach, considering issues such as chained indexing, unintended copies, index alignment, merge behavior, missing values, and dtype mismatches.",
            "Design a memory-efficient pipeline to compute a rolling 30-day feature across millions of user-time series rows without exploding memory.",
        ],
    },
    "ML Case Studies": {
        "easy": [
            "How would you detect data leakage in a churn prediction pipeline?",
            "A model performs well on training but poorly on test — what are the possible causes and fixes?",
            "How would you handle missing values differently for a numeric vs categorical feature?",
        ],
        "medium": [
            "Design an A/B test for a new recommendation algorithm — metrics, sample size, guardrails.",
            "A model trained on last year's data is degrading in production — how do you diagnose concept drift vs data drift?",
            "Design an ML pipeline to predict customer lifetime value — what features and evaluation approach would you use?",
        ],
        "hard": [
            "A fraud model has 99.9% accuracy but is \"useless in production\" — diagnose causes and propose a fix with monitoring.",
            "Design an end-to-end recommendation system for a cold-start scenario (new users, new items) — discuss hybrid approaches.",
            "A model's offline AUC improved but online business metrics dropped after deployment — list 4 possible root causes and how you'd investigate each.",
        ],
    },
    "MLOps Basics": {
        "easy": [
            "Difference between model versioning and data versioning.",
            "What does model deployment mean end-to-end? Explain how you would deploy a machine learning model using a framework like Flask/FastAPI and containerize it with Docker.",
            "Explain the difference between batch inference and online (real-time) inference.",
        ],
        "medium": [
            "How would you detect data drift in a deployed model without ground truth labels?",
            "Explain shadow deployment vs canary deployment for ML models.",
            "What components would you include in a model monitoring dashboard, and why?",
        ],
        "hard": [
            "Design a CI/CD pipeline for weekly model retraining with automated rollback — what metrics/thresholds trigger rollback?",
            "Design a system to handle training-serving skew when features are computed differently in batch vs real-time pipelines.",
            "Propose an architecture for A/B testing multiple model versions in production with traffic splitting and statistical significance tracking.",
        ],
    },
    "Big Data Basics": {
        "easy": [
            "Why would you use Spark instead of pandas? Discuss the trade-offs in terms of data size, memory usage, parallelism, and performance.",
            "What is the difference between a data lake and a data warehouse?",
            "Why is columnar storage (e.g., Parquet) more efficient than row storage for analytics?",
        ],
        "medium": [
            "Why does data shuffling become a bottleneck in distributed joins, and how does broadcast join mitigate it?",
            "Explain partitioning vs bucketing in Hive/Spark and when to use each.",
            "What is the difference between batch processing and stream processing — give use cases for each.",
        ],
        "hard": [
            "Given a Spark groupBy job spilling to disk due to skewed keys, explain the root cause and three mitigation strategies (salting, repartitioning, AQE).",
            "Design a lambda architecture for processing both real-time and batch analytics on clickstream data.",
            "Explain how Spark's Catalyst optimizer transforms a query plan, and how predicate pushdown improves performance on Parquet files.",
        ],
    },
    "OS": {
        "easy": [
            "Difference between a process and a thread.",
            "What is a deadlock, and what are the four necessary conditions for it?",
            "Explain the difference between paging and segmentation.",
        ],
        "medium": [
            "Explain the producer-consumer problem and a semaphore-based solution (pseudocode).",
            "Compare preemptive vs non-preemptive scheduling with examples of algorithms for each.",
            "Explain how virtual memory provides isolation between processes.",
        ],
        "hard": [
            "Walk through a page fault end-to-end (TLB miss, page table walk, disk I/O) and explain thrashing.",
            "Explain how a context switch works internally — what's saved/restored, and why it's expensive.",
            "Design and implement a thread-safe singleton or a thread pool. Explain the synchronization primitives used and how your design avoids race conditions.",
        ],
    },
    "DBMS": {
        "easy": [
            "Difference between clustered and non-clustered indexes.",
            "Explain primary key vs foreign key vs unique constraint.",
            "What is normalization, and explain 1NF, 2NF, 3NF with an example.",
        ],
        "medium": [
            "Explain the four ACID properties with an example transaction violating each if missing.",
            "Explain the difference between optimistic and pessimistic locking with use cases.",
            "How does a B+ tree index improve range queries compared to a hash index?",
        ],
        "hard": [
            "Given a query doing a full table scan despite an index existing, list 4 reasons the planner might skip it and how to diagnose with EXPLAIN.",
            "Explain isolation levels (Read Uncommitted to Serializable) and what anomalies each prevents, with examples.",
            "Design a sharding strategy for a multi-tenant database with uneven tenant sizes — discuss rebalancing and cross-shard query challenges.",
        ],
    },
    "Computer Networks": {
        "easy": [
            "Explain the TCP three-way handshake.",
            "Difference between TCP and UDP, with use cases for each.",
            "What happens when you type a URL into a browser and press enter (high level)?",
        ],
        "medium": [
            "Why does HTTPS use both symmetric and asymmetric encryption — explain the handshake flow.",
            "Explain DNS resolution end-to-end including caching layers.",
            "What is the difference between a forward proxy and a reverse proxy?",
        ],
        "hard": [
            "Explain how Network Address Translation (NAT) works and why it is needed. Discuss static NAT, dynamic NAT, PAT (NAT overload), and the challenges NAT introduces for peer-to-peer communication.",
            "Design a CDN architecture for serving video content globally — discuss edge caching and cache invalidation.",
            "Explain how load balancers handle sticky sessions in a horizontally scaled web app, and the tradeoffs involved.",
        ],
    },
    "OOP": {
        "easy": [
            "Difference between method overloading and overriding.",
            "Explain encapsulation with a code example.",
            "What is an abstract class vs an interface — when would you use each?",
        ],
        "medium": [
            "Explain the Liskov Substitution Principle with an example violation and how you would fix it.",
            "Explain composition vs inheritance — when is composition preferred?",
            "What is the Single Responsibility Principle, and refactor a class that violates it.",
        ],
        "hard": [
            "Design a plugin architecture using the Strategy and Factory patterns, and explain how the design adheres to the Open-Closed Principle.",
            "Explain the Observer pattern and design an event-driven notification system using it.",
            "Given a class hierarchy with deep inheritance causing fragile base class issues, redesign it using composition and interfaces.",
        ],
    },
    "System Design": {
        "easy": [
            "Design a URL shortener — core components and database schema.",
            "Design a basic notification system (email/SMS) for an e-commerce app.",
            "Design a simple key-value store — what data structure and persistence strategy would you use?",
        ],
        "medium": [
            "Design a rate limiter — compare token bucket vs sliding window log.",
            "Design a parking lot system — focus on class design and concurrency for slot allocation.",
            "Design a chat application's message delivery system — discuss read receipts and online status.",
        ],
        "hard": [
            "Design a real-time leaderboard for 100M users with sub-second updates — discuss sorted sets, sharding, and consistency trade-offs.",
            "Design a feed-generation system (e.g., Twitter's news feed) — discuss fan-out on write vs fan-out on read, caching, ranking, and scalability challenges.",
            "Design an ML model-serving infrastructure handling 10K requests/sec with autoscaling, caching, and fallback strategies.",
        ],
    },
    "API Design": {
        "easy": [
            "Difference between PUT and PATCH.",
            "What is idempotency in REST APIs, and which HTTP methods are idempotent?",
            "Explain status codes 401 vs 403 vs 404.",
        ],
        "medium": [
            "Design a paginated API — compare offset-based vs cursor-based pagination.",
            "How would you design rate limiting at the API gateway level?",
            "Explain the difference between REST and GraphQL — when would you choose GraphQL?",
        ],
        "hard": [
            "Design a versioning strategy for a public API with breaking changes affecting 1000+ clients — deprecation, backward compatibility, and contract testing.",
            "Design an idempotent payment API that handles retries safely under network failures.",
            "Design the API for a ride-sharing application. Consider endpoints for booking rides, matching drivers, tracking ride status, fare estimation, and handling concurrent requests.",
        ],
    },
    "Cloud & DevOps": {
        "easy": [
            "Difference between a container and a VM.",
            "What is CI/CD, and why does it matter in modern software development and deployment workflows?",
            "Explain the difference between horizontal and vertical scaling.",
        ],
        "medium": [
            "Explain how horizontal pod autoscaling works in Kubernetes based on CPU/memory metrics.",
            "What is the difference between a Docker image and a Docker container?",
            "Explain blue-green vs canary deployments and their tradeoffs.",
        ],
        "hard": [
            "Design a blue-green deployment for a stateful service with DB migrations — discuss failure modes and zero downtime.",
            "Design a multi-region active-active architecture for high availability — discuss data consistency tradeoffs.",
            "Explain how a service mesh (e.g., Istio) handles traffic management, retries, and observability in a microservices setup.",
        ],
    },
    "Git & Version Control": {
        "easy": [
            "Difference between git merge and git rebase.",
            "What does git stash do, and when would you use it?",
            "Explain the difference between git fetch and git pull.",
        ],
        "medium": [
            "You accidentally committed a secret key 5 commits ago and pushed — how do you remove it from history safely?",
            "Explain git cherry-pick and a scenario where you'd use it.",
            "A merge conflict occurs in a shared codebase. Walk through the step-by-step process of identifying, resolving, testing, and committing the conflict resolution safely.",
        ],
    },
}

QUESTIONS["Git & Version Control"]["hard"] = [
    "Explain Git's three-way merge algorithm internally, and design a branching strategy for 50 engineers with daily releases.",
    "Design a Git hooks-based CI workflow that prevents broken code from being merged into main.",
    "Explain how git bisect works internally and use it to debug a regression introduced across 200 commits.",
]


def main():
    print("Inserting topics...")
    topic_ids = {}
    for name in TOPICS:
        existing = supabase.table("topics").select("id").eq("name", name).execute()
        if existing.data:
            topic_ids[name] = existing.data[0]["id"]
            print(f"  exists: {name} (id={topic_ids[name]})")
            continue
        res = supabase.table("topics").insert({"name": name}).execute()
        topic_ids[name] = res.data[0]["id"]
        print(f"  inserted: {name} (id={topic_ids[name]})")

    print("\nInserting sample questions...")
    total = 0
    for topic_name, levels in QUESTIONS.items():
        topic_id = topic_ids[topic_name]
        for difficulty, questions in levels.items():
            rows = [
                {"topic_id": topic_id, "difficulty": difficulty, "question_text": q}
                for q in questions
            ]
            supabase.table("sample_questions").insert(rows).execute()
            total += len(rows)
            print(f"  {topic_name} [{difficulty}]: {len(rows)} inserted")

    print(f"\nDone. {len(topic_ids)} topics, {total} sample questions.")


if __name__ == "__main__":
    main()
