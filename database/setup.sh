# Variables
database="project"
user="'server'@'localhost'"

echo "This sctipt will drop database $database and user $user and create new ones"

# Drop the entire database and 'server' user
mysql -e "DROP DATABASE IF EXISTS $database;"
mysql -e "DROP USER IF EXISTS $user;"
# Create the new database
mysql -e "source ./setup.sql"
