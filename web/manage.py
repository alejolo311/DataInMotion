from datainmotion.routes import app
from flask.cli import FlaskGroup

cli = FlaskGroup(app)


@cli.command("create_db")
def create_db():
    return 22


if __name__ == "__main__":
    cli()
